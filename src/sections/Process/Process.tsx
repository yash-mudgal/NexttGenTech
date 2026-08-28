import { lazy, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Icon from "@/components/ui/Icon";
import { Aura } from "@/components/ui/Aura";
import SceneView from "@/components/3d/SceneView";
import { company } from "@/config/company";
import { usePrefersReducedMotion } from "@/hooks";
import { accentOf } from "@/lib/accent";
import type { AccentTheme } from "@/lib/accent";
import type { Accent } from "@/data/products";
import { cn } from "@/lib/cn";

/* Everything `three` stays behind this boundary so it never reaches the initial
 * bundle. SceneView renders it into the site's shared WebGL canvas. */
const PipelineScene = lazy(() => import("./PipelineScene"));

/** Accent rotation along the rail — blue, cyan, violet, repeat. */
const rotation: readonly Accent[] = ["brand", "cyan", "violet"];

const TOTAL = company.process.length;

/* ── Node ────────────────────────────────────────────────────────────────────
 * Purely decorative: the ordered list and the step title carry the meaning, so
 * the whole node is hidden from assistive tech and the "lit" state is free to
 * cross-fade duplicated glyphs without polluting the accessibility tree.
 * -------------------------------------------------------------------------- */

function StepNode({
  step,
  icon,
  theme,
  lit,
}: {
  step: string;
  icon: string;
  theme: AccentTheme;
  lit: MotionValue<number> | number;
}) {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-14 shrink-0 place-items-center rounded-full border border-ng-line bg-ng-surface2"
    >
      {/* Activated ring + ambient glow. */}
      <motion.span
        style={{ opacity: lit }}
        className={cn("pointer-events-none absolute -inset-px rounded-full border", theme.border, theme.bg, theme.glow)}
      />

      <Icon name={icon} className="size-5 text-ng-faint" strokeWidth={1.5} />
      <motion.span style={{ opacity: lit }} className="pointer-events-none absolute inset-0 grid place-items-center">
        <Icon name={icon} className={cn("size-5", theme.text)} strokeWidth={1.5} />
      </motion.span>

      {/* Step number, pinned to the node. */}
      <span className="absolute -right-1.5 -top-1.5 grid size-[1.375rem] place-items-center rounded-full border border-ng-line bg-ng-ink font-mono text-[0.5625rem] leading-none text-ng-faint">
        {step}
        <motion.span
          style={{ opacity: lit }}
          className="absolute inset-0 grid place-items-center rounded-full border border-ng-line2 bg-ng-ink text-ng-fg"
        >
          {step}
        </motion.span>
      </span>
    </span>
  );
}

/* ── Step ────────────────────────────────────────────────────────────────────
 * One <li> that lays out as a row on mobile and as a column straddling the rail
 * on large screens. `useTransform` lives here so each step owns its own motion
 * value without breaking the rules of hooks inside a .map().
 * -------------------------------------------------------------------------- */

function ProcessStep({
  index,
  step,
  title,
  body,
  icon,
  progress,
  reducedMotion,
}: {
  index: number;
  step: string;
  title: string;
  body: string;
  icon: string;
  progress: MotionValue<number>;
  reducedMotion: boolean;
}) {
  // The node sits at the centre of its column, so the rail reaches it at
  // (index + 0.5) / TOTAL. Light it as the fill sweeps past.
  const lit = useTransform(progress, [(index + 0.28) / TOTAL, (index + 0.72) / TOTAL], [0, 1]);
  const theme = accentOf(rotation[index % rotation.length]);
  const above = index % 2 === 0;

  return (
    <li
      className={cn(
        "relative grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-x-4",
        "lg:h-full lg:snap-start lg:grid-cols-1 lg:grid-rows-[1fr_auto_1fr] lg:gap-x-0 lg:justify-items-center",
      )}
    >
      <div className="lg:row-start-2">
        <StepNode step={step} icon={icon} theme={theme} lit={reducedMotion ? 1 : lit} />
      </div>

      <div
        className={cn(
          "col-start-2 flex w-full flex-col rounded-ng border border-ng-line bg-ng-surface2/60 p-5",
          "lg:col-start-1 lg:items-center lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:text-center",
          above ? "lg:row-start-1 lg:justify-end" : "lg:row-start-3 lg:justify-start",
        )}
      >
        {/* Connector from the content block down/up to the node. */}
        {!above && <span aria-hidden="true" className="hidden h-7 w-px bg-ng-line lg:block" />}

        <div className={cn("lg:px-1", above ? "lg:pb-0" : "lg:pt-4")}>
          <h3 className="font-display text-base font-semibold text-ng-fg lg:text-[0.9375rem]">{title}</h3>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-ng-muted lg:text-[0.8125rem]">{body}</p>
        </div>

        {above && <span aria-hidden="true" className="mt-4 hidden h-7 w-px bg-ng-line lg:block" />}
      </div>
    </li>
  );
}

/* ── Pipeline banner fallback ────────────────────────────────────────────────
 * Shown instead of the 3D pipeline on devices without WebGL and for visitors
 * who have asked for reduced motion. It is the same idea in SVG — one path,
 * seven gates, the blue → cyan → violet ramp — so those visitors get a designed
 * graphic rather than an empty 20rem band.
 * -------------------------------------------------------------------------- */

/** Undulation of the pipe at each gate, mirroring the 3D path's control points. */
const FALLBACK_WAVE = [-0.55, 0.55, -0.6, 0.3, 1.05, -0.25, 0.65];

/** Node anchors in the 1200 × 260 SVG space, bracketed by a lead-in/lead-out. */
const FALLBACK_ANCHORS: readonly (readonly [number, number])[] = [
  [10, 125],
  ...company.process.map((_, index) => {
    const x = 100 + (index * 1000) / Math.max(TOTAL - 1, 1);
    const y = 130 - FALLBACK_WAVE[index % FALLBACK_WAVE.length] * 48;
    return [x, y] as const;
  }),
  [1190, 128],
];

/**
 * Catmull-Rom through the anchors, emitted as cubic Béziers so the curve passes
 * exactly through every node — a quadratic smoothing pass would leave the gates
 * sitting slightly off their own pipe.
 */
function splinePath(points: readonly (readonly [number, number])[]): string {
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const previous = points[Math.max(i - 1, 0)];
    const start = points[i];
    const end = points[i + 1];
    const next = points[Math.min(i + 2, points.length - 1)];
    const c1x = start[0] + (end[0] - previous[0]) / 6;
    const c1y = start[1] + (end[1] - previous[1]) / 6;
    const c2x = end[0] - (next[0] - start[0]) / 6;
    const c2y = end[1] - (next[1] - start[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${end[0].toFixed(1)} ${end[1].toFixed(1)}`;
  }
  return d;
}

const FALLBACK_PATH = splinePath(FALLBACK_ANCHORS);

function PipelineFallback() {
  return (
    <svg
      viewBox="0 0 1200 260"
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 size-full"
    >
      <defs>
        <linearGradient id="ng-pipeline-ramp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-ng-brand)" />
          <stop offset="50%" stopColor="var(--color-ng-cyan)" />
          <stop offset="100%" stopColor="var(--color-ng-violet)" />
        </linearGradient>
        {/* Fades the pipe into the page at both ends, exactly as the tube's
            vertex colours do in the 3D scene. */}
        <linearGradient id="ng-pipeline-ends" x1="0" y1="0" x2="1" y2="0">
          {/* White = visible in an SVG luminance mask; the transparent ends are
              what dissolve the pipe into the page. */}
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="10%" stopColor="#fff" />
          <stop offset="90%" stopColor="#fff" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="ng-pipeline-mask">
          <rect x="0" y="0" width="1200" height="260" fill="url(#ng-pipeline-ends)" />
        </mask>
      </defs>

      <g mask="url(#ng-pipeline-mask)">
        {/* Soft casing, then the bright core, then a travelling dash. */}
        <path d={FALLBACK_PATH} fill="none" stroke="url(#ng-pipeline-ramp)" strokeWidth="14" strokeOpacity="0.12" strokeLinecap="round" />
        <path d={FALLBACK_PATH} fill="none" stroke="url(#ng-pipeline-ramp)" strokeWidth="2.5" strokeOpacity="0.85" strokeLinecap="round" />
        <path
          d={FALLBACK_PATH}
          fill="none"
          stroke="url(#ng-pipeline-ramp)"
          strokeWidth="5"
          strokeOpacity="0.65"
          strokeLinecap="round"
          strokeDasharray="14 150"
          className="animate-ng-dash"
        />

        {company.process.map((item, index) => {
          const [x, y] = FALLBACK_ANCHORS[index + 1];
          const tone = accentOf(rotation[index % rotation.length]).hex;
          return (
            <g key={item.step}>
              <circle cx={x} cy={y} r="22" fill={tone} opacity="0.1" />
              <circle cx={x} cy={y} r="12" fill="none" stroke={tone} strokeWidth="1.25" strokeOpacity="0.55" />
              <circle cx={x} cy={y} r="5" fill={tone} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export function Process() {
  const railRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 0.85", "end 0.45"],
  });

  const fill = reducedMotion ? 1 : scrollYProgress;

  return (
    <Section
      width="wide"
      spacing="lg"
      backdrop={<Aura tone="cyan" className="top-1/3 -left-40" size="size-[34rem]" opacity={14} />}
    >
      <SectionHeader
        align="left"
        eyebrow="12 — How We Work"
        title="Seven Steps From"
        highlight="Problem To Platform"
        description="Every engagement runs through the same seven stages, from understanding the workflow to supporting the platform long after launch."
      />

      {/* ── Pipeline banner ───────────────────────────────────────────────────
          Its own reserved box. The shared canvas paints above section content,
          so a scene may never sit behind copy — this band owns its height and
          nothing else is laid out inside it.

          `progress` is the same motion value that drives the rail fill below;
          the scene reads it with `.get()` inside its frame loop, so the gates
          light in step with the timeline without a single extra React render.
          ------------------------------------------------------------------- */}
      <div className="mt-10 sm:mt-12 lg:mt-14">
        <SceneView
          className="h-[15rem] w-full sm:h-[18rem] lg:h-[20rem]"
          cameraPosition={[0, 0, 9]}
          cameraFov={32}
          fallback={<PipelineFallback />}
        >
          <PipelineScene progress={scrollYProgress} />
        </SceneView>
      </div>

      <div ref={railRef} className="relative mt-14 lg:mt-20">
        <div className="overflow-x-auto ng-no-scrollbar lg:snap-x lg:snap-proximity">
          <div className="relative py-2 lg:min-w-[72rem]">
            {/* Vertical rail — mobile & tablet. Masked at the tail so it ends
                cleanly regardless of how tall the last card renders. */}
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute bottom-4 left-7 top-9 w-px bg-ng-line lg:hidden",
                "[mask-image:linear-gradient(to_bottom,#000_78%,transparent_100%)]",
              )}
            />
            <motion.div
              aria-hidden="true"
              style={{ scaleY: fill }}
              className={cn(
                "pointer-events-none absolute bottom-4 left-7 top-9 w-px origin-top lg:hidden",
                "bg-gradient-to-b from-ng-brand via-ng-cyan to-ng-violet",
                "[mask-image:linear-gradient(to_bottom,#000_78%,transparent_100%)]",
              )}
            />

            {/* Horizontal rail — large screens. */}
            <div
              aria-hidden="true"
              className="ng-fade-x pointer-events-none absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-ng-line lg:block"
            />
            <motion.div
              aria-hidden="true"
              style={{ scaleX: fill }}
              className="ng-fade-x pointer-events-none absolute inset-x-0 top-1/2 hidden h-px origin-left -translate-y-1/2 bg-gradient-to-r from-ng-brand via-ng-cyan to-ng-violet lg:block"
            />

            <ol className="relative grid gap-y-8 lg:h-[27rem] lg:grid-cols-7 lg:gap-x-5 lg:gap-y-0 xl:gap-x-6">
              {company.process.map((item, index) => (
                <ProcessStep
                  key={item.step}
                  index={index}
                  step={item.step}
                  title={item.title}
                  body={item.body}
                  icon={item.icon}
                  progress={scrollYProgress}
                  reducedMotion={reducedMotion}
                />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default Process;
