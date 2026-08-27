import { useRef } from "react";
import type { CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { sectionIds } from "@/config/links";
import { usePointer, usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";

/* ── Backdrop geometry ───────────────────────────────────────────────────────
 * A perspective grid floor receding to a horizon, two slow auras and three
 * parallax layers of glass shards. All CSS and SVG — the hero owns the WebGL
 * budget, so nothing here touches three.js.
 * -------------------------------------------------------------------------- */

/** Fades the floor out at the horizon and again as it runs past the viewer. */
const FLOOR_MASK =
  "linear-gradient(to top, transparent 0%, #000 20%, #000 58%, transparent 94%)";

interface Shard {
  /** Position as a percentage of the backdrop box. */
  left: number;
  top: number;
  /** Edge length in px. */
  size: number;
  rotate: number;
  tone: "brand" | "cyan" | "violet";
}

/**
 * Hand-placed rather than randomised, so the composition is the same on every
 * load and nothing lands on top of the headline.
 */
const shardLayers: Shard[][] = [
  // Far — small, sparse, barely there.
  [
    { left: 8, top: 14, size: 34, rotate: -22, tone: "brand" },
    { left: 26, top: 8, size: 22, rotate: 14, tone: "cyan" },
    { left: 70, top: 11, size: 28, rotate: -8, tone: "violet" },
    { left: 89, top: 22, size: 20, rotate: 26, tone: "cyan" },
    { left: 46, top: 5, size: 18, rotate: -30, tone: "brand" },
    { left: 62, top: 78, size: 24, rotate: 18, tone: "brand" },
  ],
  // Mid.
  [
    { left: 4, top: 42, size: 52, rotate: -16, tone: "cyan" },
    { left: 92, top: 48, size: 46, rotate: 22, tone: "violet" },
    { left: 16, top: 72, size: 38, rotate: 30, tone: "brand" },
    { left: 80, top: 74, size: 42, rotate: -24, tone: "cyan" },
    { left: 34, top: 88, size: 30, rotate: 10, tone: "violet" },
  ],
  // Near — largest, moves most.
  [
    { left: -2, top: 60, size: 76, rotate: -12, tone: "brand" },
    { left: 95, top: 18, size: 64, rotate: 20, tone: "cyan" },
    { left: 74, top: 92, size: 58, rotate: -28, tone: "violet" },
    { left: 10, top: 96, size: 48, rotate: 16, tone: "cyan" },
  ],
];

const shardTones: Record<Shard["tone"], string> = {
  brand: "from-ng-brand/30",
  cyan: "from-ng-cyan/25",
  violet: "from-ng-violet/25",
};

function CTABackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const pointer = usePointer();
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // One transform per depth layer — hooks can't live inside the render loop.
  const floorY = useTransform(scrollYProgress, [0, 1], ["-4%", "6%"]);
  const farY = useTransform(scrollYProgress, [0, 1], [34, -34]);
  const midY = useTransform(scrollYProgress, [0, 1], [64, -64]);
  const nearY = useTransform(scrollYProgress, [0, 1], [104, -104]);
  const layerY = [farY, midY, nearY];

  /** Pointer parallax strength per layer, in px. */
  const layerPull = [8, 17, 30];

  return (
    <div ref={ref} className="absolute inset-0">
      {/* Perspective grid floor */}
      <div className="ng-perspective absolute inset-x-[-30%] bottom-[-14%] h-[64%]">
        <motion.div
          className="ng-grid absolute inset-0 origin-bottom opacity-60"
          style={{
            rotateX: 72,
            maskImage: FLOOR_MASK,
            WebkitMaskImage: FLOOR_MASK,
            ...(reducedMotion ? {} : { y: floorY }),
          }}
        />
      </div>

      {/* Horizon */}
      <div className="absolute inset-x-[12%] top-[52%] h-px bg-gradient-to-r from-transparent via-ng-cyan/25 to-transparent" />
      <div className="absolute inset-x-[22%] top-[52%] h-24 -translate-y-full bg-gradient-to-t from-ng-brand/[0.09] to-transparent blur-2xl" />

      {/* Slow-drifting auras */}
      <motion.div
        className="ng-aura-brand absolute left-[8%] top-[4%] size-[34rem] rounded-full opacity-[0.15] blur-[110px]"
        animate={reducedMotion ? undefined : { x: [0, 34, 0], y: [0, -20, 0] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 28, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="ng-aura-violet absolute right-[4%] bottom-[2%] size-[30rem] rounded-full opacity-[0.12] blur-[110px]"
        animate={reducedMotion ? undefined : { x: [0, -26, 0], y: [0, 22, 0] }}
        transition={
          reducedMotion
            ? undefined
            : { duration: 36, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* Glass shards */}
      {shardLayers.map((shards, depth) => (
        <motion.div
          key={depth}
          className="absolute inset-0"
          style={reducedMotion ? undefined : { y: layerY[depth] }}
        >
          <div
            className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={
              reducedMotion
                ? undefined
                : {
                    transform: `translate3d(${(-pointer.x * layerPull[depth]).toFixed(2)}px, ${(
                      -pointer.y *
                      layerPull[depth] *
                      0.6
                    ).toFixed(2)}px, 0)`,
                  }
            }
          >
            {shards.map((shard) => (
              <span
                key={`${shard.left}-${shard.top}`}
                className={cn(
                  "absolute block rounded-[5px] border border-white/[0.07]",
                  "bg-gradient-to-br to-transparent",
                  shardTones[shard.tone],
                )}
                style={{
                  left: `${shard.left}%`,
                  top: `${shard.top}%`,
                  width: shard.size,
                  height: shard.size * 0.68,
                  transform: `rotate(${shard.rotate}deg) skewX(-14deg)`,
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/** Gradient hairline: a 1px ring drawn as border-box minus content-box. */
const hairline: CSSProperties = {
  padding: 1,
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
};

/**
 * The closing argument — the last thing a visitor reads before the contact
 * form. One slab, one headline, two routes forward.
 */
export function CTASection() {
  return (
    <Section
      label="Start a project"
      width="default"
      spacing="lg"
      backdrop={<CTABackdrop />}
    >
      <Reveal direction="up" scale>
        <div className="ng-glass relative overflow-hidden rounded-ng-xl px-6 py-14 text-center shadow-ng-lift sm:px-12 sm:py-18 lg:py-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-ng-brand/55 via-ng-cyan/25 to-transparent"
            style={hairline}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-ng-cyan/50 to-transparent"
          />

          <span
            aria-hidden="true"
            className="mx-auto mb-8 block h-px w-16 bg-gradient-to-r from-transparent via-ng-brand-soft to-transparent"
          />

          <h2 className="mx-auto max-w-4xl text-balance font-display text-[clamp(2rem,1.2rem+3.4vw,3.75rem)] font-semibold leading-[1.06] text-ng-fg">
            Your Business Has a Problem.{" "}
            <span className="ng-gradient-text">
              Let&rsquo;s Build the Software That Solves It.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-[1.0625rem] leading-relaxed text-ng-muted">
            Tell us where the friction actually is — the workflow held together by a spreadsheet,
            the system that never quite fitted — and we&rsquo;ll scope what it takes to replace it.
          </p>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="primary"
              size="lg"
              arrow="right"
              href={`#${sectionIds.contact}`}
              className="w-full sm:w-auto"
            >
              Start a Project
            </Button>
            <Button
              variant="secondary"
              size="lg"
              arrow="right"
              href={`#${sectionIds.products}`}
              className="w-full sm:w-auto"
            >
              Explore Products
            </Button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

export default CTASection;
