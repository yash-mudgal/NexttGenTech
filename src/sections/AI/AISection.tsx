import { lazy, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import SceneView from "@/components/3d/SceneView";
import { aiCapabilities, aiNodes } from "@/data/ai";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/cn";
import NeuralCore, { ENGINE_LABEL } from "./NeuralCore";

/* Everything `three` stays behind this boundary so it never touches the
 * initial bundle. SceneView renders it into the site's shared WebGL canvas. */
const NeuralScene = lazy(() => import("./NeuralScene"));

/**
 * How the team approaches AI work. Written as engineering practice, not as a
 * product claim — deliberately unquantified.
 */
const approach: { label: string; body: string }[] = [
  {
    label: "Grounded",
    body: "Models work against the data your business already holds, inside the systems that hold it.",
  },
  {
    label: "Evaluated",
    body: "Behaviour is tested against real cases before a feature reaches production.",
  },
  {
    label: "Supervised",
    body: "A person stays in the loop wherever the output drives a decision that matters.",
  },
];

export function AISection() {
  const isMobile = useIsMobile();

  /** Click/tap selection — survives the pointer leaving. */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** Transient pointer/keyboard focus. */
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeId = hoveredId ?? selectedId;
  const activeNode = aiNodes.find((node) => node.id === activeId) ?? null;

  const select = (id: string) => setSelectedId((current) => (current === id ? null : id));

  return (
    <Section
      id="ai"
      width="wide"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop density="coarse" />
          <Aura tone="violet" className="-top-32 left-[8%]" size="size-[40rem]" opacity={16} />
          <Aura tone="cyan" className="-bottom-40 right-[4%]" size="size-[34rem]" opacity={12} />
        </>
      }
    >
      <SectionHeader
        align="left"
        eyebrow="03 — AI & Innovation"
        title="Intelligence Built"
        highlight="Into Software"
        description="We design AI into business systems where it measurably helps — inside the workflow people already use — rather than bolting a chat box onto a finished product."
      />

      <div className="mt-14 grid items-center gap-14 lg:mt-20 lg:grid-cols-[0.9fr_1.1fr]">
        {/* ── Capabilities ──────────────────────────────────────────────── */}
        <div>
          <Reveal direction="up">
            <p className="max-w-xl text-[1.0625rem] leading-relaxed text-ng-muted">
              Most of the value sits in the unglamorous places: a form that fills itself, a report
              that explains what changed, a queue that routes itself correctly. These are the
              capabilities our engineers build with, applied to the systems a business already runs
              on.
            </p>
          </Reveal>

          <Stagger as="ul" className="mt-8 grid gap-2.5 sm:grid-cols-2" gap={0.05}>
            {aiCapabilities.map((capability) => (
              <StaggerItem as="li" key={capability}>
                <span
                  className={[
                    "group flex h-full items-center gap-2.5 rounded-ng border border-ng-line",
                    "bg-white/[0.025] px-3.5 py-2.5 backdrop-blur-sm",
                    "transition-[transform,border-color,background-color] duration-400",
                    "hover:-translate-y-0.5 hover:border-ng-violet/40 hover:bg-ng-violet/[0.07]",
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rotate-45 bg-gradient-to-br from-ng-violet to-ng-cyan opacity-70 transition-opacity duration-400 group-hover:opacity-100"
                  />
                  <span className="text-[0.8125rem] leading-tight text-ng-fg2 transition-colors duration-400 group-hover:text-ng-fg">
                    {capability}
                  </span>
                </span>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal direction="up" delay={0.12}>
            <ul className="mt-9 space-y-3.5 border-t border-ng-line pt-7">
              {approach.map((item) => (
                <li key={item.label} className="flex gap-3.5">
                  <span className="mt-[0.1875rem] w-[4.75rem] shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ng-cyan">
                    {item.label}
                  </span>
                  <span className="text-sm leading-relaxed text-ng-muted">{item.body}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ── Neural network visual ─────────────────────────────────────── */}
        <Reveal direction="up" delay={0.1} scale>
          <div className="w-full">
            <SceneView
              className="mx-auto aspect-square w-full max-w-[34rem]"
              cameraPosition={[0, 0, 9.5]}
              cameraFov={45}
              fallback={<NeuralCore activeId={activeId} />}
            >
              <NeuralScene activeId={activeId} coreLabel={ENGINE_LABEL} compact={isMobile} />
            </SceneView>

            {/*
              The accessible control surface. The network above is aria-hidden
              and pointer-transparent — a canvas cannot be tabbed to — so every
              layer is selected from here and the scene mirrors the result.
            */}
            <ul className="mt-5 flex flex-wrap justify-center gap-2">
              {aiNodes.map((node) => {
                const isActive = activeId === node.id;
                return (
                  <li key={node.id}>
                    <button
                      type="button"
                      aria-pressed={selectedId === node.id}
                      onPointerEnter={() => setHoveredId(node.id)}
                      onPointerLeave={() => setHoveredId(null)}
                      onFocus={() => setHoveredId(node.id)}
                      onBlur={() => setHoveredId(null)}
                      onClick={() => select(node.id)}
                      className={cn(
                        "flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2",
                        "transition-[color,background-color,border-color] duration-300",
                        isActive
                          ? "border-ng-violet/50 bg-ng-violet/15 text-ng-fg"
                          : "border-ng-line bg-white/[0.03] text-ng-fg2 hover:border-ng-line2",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 shrink-0 rounded-full transition-colors duration-300",
                          isActive ? "bg-ng-cyan" : "bg-ng-brand-soft",
                        )}
                      />
                      <span className="text-[0.75rem] font-medium leading-tight">{node.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div
              aria-live="polite"
              className="mt-4 min-h-[5rem] rounded-ng border border-ng-line bg-ng-surface/60 px-4 py-3.5 sm:min-h-[4.5rem]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {activeNode ? (
                  <motion.div
                    key={activeNode.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ng-violet">
                      {activeNode.label}
                    </span>
                    <p className="mt-1.5 text-sm leading-relaxed text-ng-fg2">
                      {activeNode.detail}
                    </p>
                  </motion.div>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.24 }}
                    className="text-sm leading-relaxed text-ng-muted"
                  >
                    <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ng-faint">
                      Layers
                    </span>
                    <span className="mt-1.5 block">
                      Select a layer to see the part it plays in a working system.
                    </span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default AISection;
