import { useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal } from "@/components/ui/Reveal";
import Icon from "@/components/ui/Icon";
import Tag from "@/components/ui/Tag";
import { company } from "@/config/company";
import { products } from "@/data/products";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks";
import EcosystemNode from "./EcosystemNode";
import type { EcoNode } from "./EcosystemNode";

/* ── Geometry ───────────────────────────────────────────────────────────────
 * The map is drawn in a 1000×1000 user space so the dash animation (which ends
 * at a fixed -220 offset) reads as a slow, deliberate flow rather than a blur.
 * -------------------------------------------------------------------------- */

const CENTRE = 500;
const RADIUS = 370;
const START_ANGLE = -90;

/* ── Nodes ──────────────────────────────────────────────────────────────────
 * Six platforms come straight from the data layer. The three shared layers are
 * declared here because they are properties of the ecosystem, not products.
 * -------------------------------------------------------------------------- */

const CORE: EcoNode = {
  id: "core",
  label: `${company.shortName} Business Core`,
  icon: "layers",
  kind: "Shared core",
  description:
    "Every platform is assembled on the same foundation: one data model, one identity and permission layer, one reporting surface. Add a second system and it joins the one already running instead of starting its own island of records.",
  modulesLabel: "What the core provides",
  modules: [
    "Unified Data Model",
    "Single Sign-On",
    "Roles & Permissions",
    "Cross-System Reporting",
    "Notifications",
    "Audit Trail",
    "APIs & Integrations",
    "Cloud Deployment",
  ],
  accent: accentOf("brand"),
};

const productNodes: EcoNode[] = products.map((product) => ({
  id: product.id,
  label: product.name,
  icon: product.icon,
  kind: product.category,
  description: product.description,
  modulesLabel: "Key modules",
  modules: product.modules.slice(0, 8),
  accent: accentOf(product.accent),
}));

const layerNodes: EcoNode[] = [
  {
    id: "ai",
    label: "AI",
    icon: "sparkles",
    kind: "Intelligence layer",
    description:
      "Intelligence applied to the operational data the platforms already hold — assistants, document understanding and predictive signals that live inside the modules teams use every day.",
    modulesLabel: "Capabilities",
    modules: [
      "AI Assistants",
      "Document Intelligence",
      "Predictive Intelligence",
      "Intelligent Automation",
      "AI-Powered Analytics",
      "LLM Integration",
    ],
    accent: accentOf("violet"),
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "bar-chart-3",
    kind: "Reporting layer",
    description:
      "One reporting surface across every connected system, so a number means the same thing in finance, in operations and in the review meeting. Metrics are consolidated rather than exported and reconciled by hand.",
    modulesLabel: "Capabilities",
    modules: [
      "Cross-System Reports",
      "Dashboards",
      "KPI Tracking",
      "Business Intelligence",
      "Scheduled Reporting",
      "Data Export",
    ],
    accent: accentOf("cyan"),
  },
  {
    id: "cloud",
    label: "Cloud",
    icon: "cloud",
    kind: "Infrastructure layer",
    description:
      "Containerised services, staged environments and monitored deployments underneath all of it, with capacity designed to grow alongside branches, users and data volume.",
    modulesLabel: "Capabilities",
    modules: [
      "Cloud Architecture",
      "Cloud Deployment",
      "CI/CD",
      "Docker",
      "Application Monitoring",
      "Secure Deployment",
      "Scalable Infrastructure",
    ],
    accent: accentOf("brand"),
  },
];

const ecosystemNodes: EcoNode[] = [...productNodes, ...layerNodes];

/** Roving-tabindex order: the core sits first, then the ring, clockwise. */
const tabItems: EcoNode[] = [CORE, ...ecosystemNodes];

/** Faint chords between neighbouring platforms, hinting at cross-system flow. */
const chords: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
];

/* ── Detail panel ───────────────────────────────────────────────────────── */

function NodeDetail({ node }: { node: EcoNode }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span
          className={cn("inline-flex size-11 items-center justify-center rounded-ng", node.accent.chip)}
        >
          <Icon name={node.icon} className="size-5" strokeWidth={1.6} />
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ng-muted">
            {node.kind}
          </span>
          <span className="mt-1 block font-display text-lg font-semibold leading-tight text-ng-fg">
            {node.label}
          </span>
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ng-muted">{node.description}</p>

      <div className="mt-6 flex items-center gap-3">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ng-faint">
          {node.modulesLabel}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-ng-line" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {node.modules.map((module) => (
          <Tag key={module} size="xs">
            {module}
          </Tag>
        ))}
      </div>
    </>
  );
}

/* ── Section ────────────────────────────────────────────────────────────── */

/**
 * The connected-platform map: nine systems orbiting a shared core, with a
 * detail panel that follows hover, focus and selection. Below `md` the radial
 * would be an unreadable tangle, so the same data becomes an accordion.
 */
export function ErpEcosystem() {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const isMobile = useIsMobile();
  const reducedMotion = usePrefersReducedMotion();

  const [pinned, setPinned] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeId = hovered ?? pinned;
  const detail = activeId ? (tabItems.find((node) => node.id === activeId) ?? CORE) : CORE;

  const positions = useMemo(
    () =>
      ecosystemNodes.map((_, index) => {
        const angle =
          ((START_ANGLE + (360 / ecosystemNodes.length) * index) * Math.PI) / 180;
        return {
          x: CENTRE + RADIUS * Math.cos(angle),
          y: CENTRE + RADIUS * Math.sin(angle),
        };
      }),
    [],
  );

  const moveFocus = (next: number) => {
    const total = tabItems.length;
    const index = ((next % total) + total) % total;
    setFocusIndex(index);
    nodeRefs.current[index]?.focus();
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        moveFocus(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        moveFocus(index - 1);
        break;
      case "Home":
        event.preventDefault();
        moveFocus(0);
        break;
      case "End":
        event.preventDefault();
        moveFocus(tabItems.length - 1);
        break;
      default:
        break;
    }
  };

  const toggle = (id: string) => {
    setPinned((current) => (current === id ? null : id));
    // Keep the single tab stop on whatever the visitor last acted on.
    const index = tabItems.findIndex((node) => node.id === id);
    if (index >= 0) setFocusIndex(index);
  };

  return (
    <Section
      label="Connected platform ecosystem"
      width="wide"
      spacing="lg"
      backdrop={
        <>
          <GridBackdrop density="fine" />
          <Aura
            tone="cyan"
            size="size-[44rem]"
            opacity={15}
            className="left-1/2 top-1/4 -translate-x-1/2"
          />
        </>
      }
    >
      <SectionHeader
        align="center"
        eyebrow="02 — Connected Platform"
        title="One Ecosystem,"
        highlight="Every System Connected"
        description="The platforms share a common core — the same data model, the same identity and permissions, the same reporting layer. A school, a hospital or a growing business ends up running one connected system rather than six tools that only agree on the login screen."
      />

      {isMobile ? (
        /* ── Accordion fallback ───────────────────────────────────────── */
        <div className="mt-12">
          <div className="ng-card rounded-ng-card p-5">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-ng",
                  CORE.accent.chip,
                )}
              >
                <Icon name={CORE.icon} className="size-5" strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ng-cyan">
                  {CORE.kind}
                </span>
                <span className="mt-1 block font-display text-base font-semibold text-ng-fg">
                  {CORE.label}
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ng-muted">{CORE.description}</p>
          </div>

          <ul className="mt-3 space-y-3">
            {ecosystemNodes.map((node) => {
              const open = pinned === node.id;
              const regionId = `${baseId}-${node.id}`;
              return (
                <li key={node.id} className="ng-card overflow-hidden rounded-ng-card">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={regionId}
                    onClick={() => toggle(node.id)}
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <span
                      className={cn(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-ng transition-colors duration-300",
                        open ? node.accent.chip : "ng-glass text-ng-fg2",
                      )}
                    >
                      <Icon name={node.icon} className="size-5" strokeWidth={1.6} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-ng-fg">
                        {node.label}
                      </span>
                      <span className="mt-0.5 block truncate font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ng-muted">
                        {node.kind}
                      </span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={cn(
                        "size-4 shrink-0 text-ng-muted transition-transform duration-[420ms] ease-ng",
                        open && "rotate-180",
                      )}
                    />
                  </button>

                  <div
                    id={regionId}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-[420ms] ease-ng",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-ng-line px-4 py-4">
                        <p className="text-sm leading-relaxed text-ng-muted">{node.description}</p>
                        <div className="mt-4 flex items-center gap-3">
                          <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ng-faint">
                            {node.modulesLabel}
                          </span>
                          <span aria-hidden="true" className="h-px flex-1 bg-ng-line" />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {node.modules.map((module) => (
                            <Tag key={module} size="xs">
                              {module}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        /* ── Radial map ───────────────────────────────────────────────── */
        <div className="mt-14 grid items-center gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <Reveal direction="none" scale className="min-w-0">
            <div
              role="tablist"
              aria-label="Connected systems"
              aria-orientation="horizontal"
              className="relative mx-auto aspect-square w-full max-w-[36rem]"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 1000 1000"
                className="absolute inset-0 size-full"
              >
                <defs>
                  {ecosystemNodes.map((node, index) => {
                    const point = positions[index];
                    if (!point) return null;
                    return (
                      <linearGradient
                        key={node.id}
                        id={`${baseId}-spoke-${node.id}`}
                        gradientUnits="userSpaceOnUse"
                        x1={CENTRE}
                        y1={CENTRE}
                        x2={point.x}
                        y2={point.y}
                      >
                        <stop offset="0%" stopColor={node.accent.hex} stopOpacity={0.06} />
                        <stop offset="55%" stopColor={node.accent.hex} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={node.accent.hex} stopOpacity={0.85} />
                      </linearGradient>
                    );
                  })}
                </defs>

                {/* Orbit guide. */}
                <circle
                  cx={CENTRE}
                  cy={CENTRE}
                  r={RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray="5 13"
                  className="text-ng-line"
                />

                {/* Cross-system chords between neighbouring platforms. */}
                {chords.map(([from, to]) => {
                  const a = positions[from];
                  const b = positions[to];
                  if (!a || !b) return null;
                  const involved =
                    activeId === ecosystemNodes[from]?.id || activeId === ecosystemNodes[to]?.id;
                  return (
                    <line
                      key={`chord-${from}-${to}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="currentColor"
                      strokeWidth={involved ? 1.6 : 1}
                      strokeOpacity={activeId && !involved ? 0.18 : 0.55}
                      className="text-ng-line2 transition-all duration-[420ms] ease-ng"
                    />
                  );
                })}

                {/* Spokes from the core out to each system. */}
                {ecosystemNodes.map((node, index) => {
                  const point = positions[index];
                  if (!point) return null;
                  const isActive = activeId === node.id;
                  const dimmed = Boolean(activeId) && !isActive;
                  return (
                    <line
                      key={node.id}
                      x1={CENTRE}
                      y1={CENTRE}
                      x2={point.x}
                      y2={point.y}
                      stroke={`url(#${baseId}-spoke-${node.id})`}
                      strokeWidth={isActive ? 6 : 3}
                      strokeLinecap="round"
                      strokeDasharray="18 26"
                      strokeOpacity={dimmed ? 0.3 : 1}
                      style={reducedMotion ? undefined : { animationDuration: isActive ? "1.1s" : "2.6s" }}
                      className={cn(
                        "transition-[stroke-width,stroke-opacity] duration-[420ms] ease-ng",
                        !reducedMotion && "animate-ng-dash",
                      )}
                    />
                  );
                })}
              </svg>

              {/* Core. */}
              <button
                ref={(element) => {
                  nodeRefs.current[0] = element;
                }}
                id={`${baseId}-tab-core`}
                type="button"
                role="tab"
                aria-selected={pinned === null}
                aria-controls={panelId}
                tabIndex={focusIndex === 0 ? 0 : -1}
                onMouseEnter={() => setHovered(CORE.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(CORE.id)}
                onBlur={() => setHovered(null)}
                onClick={() => {
                  setPinned(null);
                  setFocusIndex(0);
                }}
                onKeyDown={handleKeyDown(0)}
                className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 rounded-full ring-1 ring-ng-cyan/40",
                    !reducedMotion && "animate-ng-pulse-ring",
                  )}
                />
                <span
                  className={cn(
                    "ng-glass relative flex size-26 flex-col items-center justify-center gap-1 rounded-full transition-all duration-[420ms] ease-ng sm:size-32",
                    activeId === CORE.id
                      ? "ring-1 ring-ng-cyan/50 shadow-ng-glow-cyan"
                      : "ring-1 ring-ng-line",
                  )}
                >
                  <span className="font-display text-[0.6875rem] font-semibold tracking-[0.22em] text-ng-fg sm:text-xs">
                    {company.logoMark}
                  </span>
                  <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ng-cyan sm:text-[0.5625rem]">
                    Business Core
                  </span>
                </span>
              </button>

              {/* Ring. */}
              {ecosystemNodes.map((node, index) => {
                const point = positions[index];
                if (!point) return null;
                const isActive = activeId === node.id;
                return (
                  <EcosystemNode
                    key={node.id}
                    node={node}
                    x={point.x / 10}
                    y={point.y / 10}
                    active={isActive}
                    selected={pinned === node.id}
                    dimmed={Boolean(activeId) && !isActive}
                    id={`${baseId}-tab-${node.id}`}
                    panelId={panelId}
                    tabIndex={focusIndex === index + 1 ? 0 : -1}
                    registerRef={(element) => {
                      nodeRefs.current[index + 1] = element;
                    }}
                    onHover={setHovered}
                    onSelect={toggle}
                    onKeyDown={handleKeyDown(index + 1)}
                  />
                );
              })}
            </div>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <div
              id={panelId}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={`${baseId}-tab-${detail.id}`}
              className="ng-card min-h-[21rem] rounded-ng-lg p-6 sm:p-7"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={detail.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NodeDetail node={detail} />
                </motion.div>
              </AnimatePresence>

              <p className="mt-7 border-t border-ng-line pt-4 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ng-faint">
                {pinned ? "Selected — click again to release" : "Hover or select a system"}
              </p>
            </div>
          </Reveal>
        </div>
      )}
    </Section>
  );
}

export default ErpEcosystem;
