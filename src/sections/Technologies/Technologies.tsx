import { lazy, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Icon from "@/components/ui/Icon";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal } from "@/components/ui/Reveal";
import SceneView from "@/components/3d/SceneView";
import { techCategories, technologies, technologiesIn } from "@/data/technologies";
import type { TechCategoryId } from "@/data/technologies";
import { cn } from "@/lib/cn";

import TechnologyCard from "./TechnologyCard";

/* Everything `three` stays behind this boundary so it never reaches the initial
 * bundle. SceneView renders it into the site's shared WebGL canvas. */
const TechSphereScene = lazy(() => import("./TechSphereScene"));

type FilterId = "all" | TechCategoryId;

interface TechFilter {
  id: FilterId;
  label: string;
  icon: string;
  blurb: string;
  count: number;
}

const filters: TechFilter[] = [
  {
    id: "all",
    label: "All",
    icon: "layout-grid",
    blurb: "Every technology we work with, grouped by where it sits in the stack.",
    count: technologies.length,
  },
  ...techCategories.map<TechFilter>((category) => ({
    id: category.id,
    label: category.label,
    icon: category.icon,
    blurb: category.blurb,
    count: technologiesIn(category.id).length,
  })),
];

/** Pre-grouped wall used by the "All" view. */
const groups = techCategories.map((category) => ({
  category,
  items: technologiesIn(category.id),
}));

const pad2 = (value: number) => String(value).padStart(2, "0");

/* ── Sphere fallback ─────────────────────────────────────────────────────────
 * The designed stand-in shown to visitors without WebGL and to anyone who has
 * asked for reduced motion. It runs the same golden-spiral distribution as the
 * 3D scene, projected orthographically, so the two read as the same object.
 * -------------------------------------------------------------------------- */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Tilt applied before projection, so the spiral reads as a globe. */
const SPHERE_TILT = 0.34;
const SPHERE_CX = 200;
const SPHERE_CY = 150;
const SPHERE_R = 118;

/** Back-to-front, so nearer tiles paint over the ones behind them. */
const projectedTech = technologies
  .map((tech, index) => {
    const y = 1 - ((index + 0.5) / technologies.length) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * index;
    const z = Math.sin(theta) * ring;
    return {
      tech,
      x: Math.cos(theta) * ring,
      y: y * Math.cos(SPHERE_TILT) - z * Math.sin(SPHERE_TILT),
      depth: y * Math.sin(SPHERE_TILT) + z * Math.cos(SPHERE_TILT),
    };
  })
  .sort((a, b) => a.depth - b.depth);

function TechSphereFallback({ active }: { active: FilterId }) {
  return (
    <div className="absolute inset-0">
      <svg
        viewBox="0 0 400 300"
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 size-full"
      >
        <defs>
          <radialGradient id="ng-tech-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-ng-brand)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-ng-brand)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={SPHERE_CX} cy={SPHERE_CY} r={SPHERE_R * 1.2} fill="url(#ng-tech-core)" />

        {/* Great circles, matching the three the scene draws. */}
        <g fill="none" stroke="var(--color-ng-cyan)" strokeOpacity="0.16">
          <ellipse cx={SPHERE_CX} cy={SPHERE_CY} rx={SPHERE_R} ry={SPHERE_R * 0.34} />
          <ellipse
            cx={SPHERE_CX}
            cy={SPHERE_CY}
            rx={SPHERE_R}
            ry={SPHERE_R * 0.34}
            transform={`rotate(58 ${SPHERE_CX} ${SPHERE_CY})`}
          />
          <ellipse
            cx={SPHERE_CX}
            cy={SPHERE_CY}
            rx={SPHERE_R}
            ry={SPHERE_R * 0.34}
            transform={`rotate(-58 ${SPHERE_CX} ${SPHERE_CY})`}
          />
        </g>
        <circle
          cx={SPHERE_CX}
          cy={SPHERE_CY}
          r={SPHERE_R}
          fill="none"
          stroke="var(--color-ng-line)"
          strokeDasharray="3 12"
          className="animate-ng-dash"
        />

        {/* Core */}
        <circle cx={SPHERE_CX} cy={SPHERE_CY} r="17" fill="var(--color-ng-brand-deep)" />
        <circle
          cx={SPHERE_CX}
          cy={SPHERE_CY}
          r="24"
          fill="none"
          stroke="var(--color-ng-brand-soft)"
          strokeOpacity="0.5"
        />

        {/* Tiles */}
        {projectedTech.map(({ tech, x, y, depth }) => {
          const near = (depth + 1) / 2;
          const size = 13 + near * 7;
          const on = active === "all" || tech.category === active;
          return (
            <rect
              key={tech.name}
              x={SPHERE_CX + x * SPHERE_R - size / 2}
              y={SPHERE_CY - y * SPHERE_R - size / 2}
              width={size}
              height={size}
              rx={size * 0.32}
              fill={tech.tint}
              opacity={(0.35 + near * 0.6) * (on ? 1 : 0.25)}
              className="transition-opacity duration-500"
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Technology stack — a filterable wall of tiles.
 *
 * The filter rail is a real tab group (roving tabIndex, arrow/Home/End
 * navigation, `aria-selected`, `aria-controls`), and the wall itself reflows
 * through framer's layout engine so filtering never snaps.
 */
export function Technologies() {
  const [active, setActive] = useState<FilterId>("all");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const activeFilter = filters.find((f) => f.id === active) ?? filters[0];

  const visible = useMemo(
    () => (active === "all" ? [] : technologies.filter((t) => t.category === active)),
    [active],
  );

  function selectAt(index: number) {
    setActive(filters[index].id);
    tabRefs.current[index]?.focus();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = filters.findIndex((f) => f.id === active);
    let next: number;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (current + 1) % filters.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (current - 1 + filters.length) % filters.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = filters.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectAt(next);
  }

  /* One flat array of grid children so AnimatePresence can track every tile by
     key across both the grouped and the filtered view. */
  const wall: ReactNode[] =
    active === "all"
      ? groups.flatMap(({ category, items }) => [
          <motion.div
            key={`group-${category.id}`}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="col-span-full flex items-center gap-3 pt-4 first:pt-0"
          >
            <Icon name={category.icon} className="size-3.5 shrink-0 text-ng-cyan" />
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ng-fg2">
              {category.label}
            </span>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gradient-to-r from-ng-line2 via-ng-line to-transparent"
            />
            <span className="font-mono text-[0.6875rem] text-ng-faint">
              {pad2(items.length)}
            </span>
          </motion.div>,
          ...items.map((tech) => <TechnologyCard key={tech.name} tech={tech} />),
        ])
      : visible.map((tech) => <TechnologyCard key={tech.name} tech={tech} />);

  return (
    <Section
      id="technologies"
      aria-labelledby="technologies-heading"
      width="wide"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop density="fine" />
          <Aura
            tone="brand"
            size="size-[44rem]"
            opacity={14}
            className="-top-40 left-1/2 -translate-x-1/2"
          />
        </>
      }
    >
      <SectionHeader
        align="center"
        headingId="technologies-heading"
        eyebrow="07 — Technology Stack"
        title="The Stack Behind"
        highlight="Every Build"
        description="These are the languages, frameworks, data engines and platforms our engineers work with day to day."
      />

      {/* The sphere answers the filter rail below it: the selected category
          brightens and lifts, everything else drops to a quarter strength. */}
      <SceneView
        className="mx-auto mt-8 h-[20rem] w-full max-w-[42rem] sm:h-[24rem] lg:mt-10 lg:h-[27rem]"
        cameraPosition={[0, 0, 10.5]}
        cameraFov={42}
        fallback={<TechSphereFallback active={active} />}
      >
        <TechSphereScene active={active} />
      </SceneView>

      <Reveal direction="up" delay={0.14} className="mt-10">
        <div
          role="tablist"
          aria-label="Filter technologies by category"
          onKeyDown={onTabKeyDown}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {filters.map((filter, index) => {
            const selected = filter.id === active;
            return (
              <button
                key={filter.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                id={`tech-tab-${filter.id}`}
                aria-selected={selected}
                aria-controls="tech-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(filter.id)}
                className={cn(
                  "relative inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 transition-colors duration-300",
                  selected
                    ? "border-ng-cyan/40 text-ng-fg"
                    : "border-ng-line text-ng-muted hover:border-ng-line2 hover:text-ng-fg2",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId="ng-tech-filter"
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-ng-brand/28 via-ng-cyan/20 to-ng-violet/24"
                    transition={{ type: "spring", stiffness: 420, damping: 38 }}
                  />
                )}
                <Icon name={filter.icon} className="size-3.5 shrink-0" />
                <span className="font-display text-[0.8125rem] font-medium">
                  {filter.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-[0.625rem] tabular-nums transition-colors duration-300",
                    selected ? "text-ng-cyan" : "text-ng-faint",
                  )}
                >
                  {pad2(filter.count)}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <div className="mt-5 flex min-h-10 items-start justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={activeFilter.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="max-w-xl text-center text-sm leading-relaxed text-ng-muted"
          >
            {activeFilter.blurb}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.div
        layout
        id="tech-panel"
        role="tabpanel"
        aria-labelledby={`tech-tab-${active}`}
        tabIndex={0}
        className="mt-6 grid min-h-[18rem] grid-cols-2 items-stretch gap-3 rounded-ng-card sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {wall}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
}

export default Technologies;
