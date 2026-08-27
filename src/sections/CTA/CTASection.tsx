import { lazy, useRef } from "react";
import type { CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import SceneView from "@/components/3d/SceneView";
import { sectionIds } from "@/config/links";
import { usePointer, usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";

/* Everything `three` stays behind this boundary so it never reaches the initial
 * bundle. SceneView renders it into the site's shared WebGL canvas. */
const CTAScene = lazy(() => import("./CTAScene"));

/* ── Ambience ────────────────────────────────────────────────────────────────
 * Two slow auras behind the slab. This is the only decorative layer that sits
 * *behind* the copy, so it stays pure CSS at 12–15% opacity — the shared canvas
 * paints above section content and could never be used here without dimming the
 * headline.
 * -------------------------------------------------------------------------- */

function CTAAmbience() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="absolute inset-0">
      <motion.div
        className="ng-aura-brand absolute left-[8%] top-[4%] size-[34rem] rounded-full opacity-[0.15] blur-[110px]"
        animate={reducedMotion ? undefined : { x: [0, 34, 0], y: [0, -20, 0] }}
        transition={
          reducedMotion ? undefined : { duration: 28, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="ng-aura-violet absolute bottom-[2%] right-[4%] size-[30rem] rounded-full opacity-[0.12] blur-[110px]"
        animate={reducedMotion ? undefined : { x: [0, -26, 0], y: [0, 22, 0] }}
        transition={
          reducedMotion ? undefined : { duration: 36, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </div>
  );
}

/* ── Closing-band fallback ───────────────────────────────────────────────────
 * The CSS composition that used to be the whole backdrop: a perspective grid
 * floor receding to a horizon and three parallax layers of glass shards. It now
 * serves the visitors the WebGL scene can't — no WebGL, or reduced motion — and
 * it fills exactly the same band the 3D floor occupies.
 * -------------------------------------------------------------------------- */

/** Fades the floor out at the horizon and again as it runs past the viewer. */
const FLOOR_MASK =
  "linear-gradient(to top, transparent 0%, #000 20%, #000 58%, transparent 94%)";

interface Shard {
  /** Position as a percentage of the band. */
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

function CTABandFallback() {
  const ref = useRef<HTMLDivElement>(null);
  const pointer = usePointer();
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // One transform per depth layer — hooks can't live inside the render loop.
  // Travel is shorter than it was across the full section: the band is a
  // fraction of the height, so the same numbers would read as a lurch.
  const floorY = useTransform(scrollYProgress, [0, 1], ["-3%", "4%"]);
  const farY = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const midY = useTransform(scrollYProgress, [0, 1], [34, -34]);
  const nearY = useTransform(scrollYProgress, [0, 1], [56, -56]);
  const layerY = [farY, midY, nearY];

  /** Pointer parallax strength per layer, in px. */
  const layerPull = [8, 17, 30];

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {/* Perspective grid floor */}
      <div className="ng-perspective absolute inset-x-[-20%] bottom-[-10%] h-[96%]">
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
      <div className="absolute inset-x-[12%] top-[46%] h-px bg-gradient-to-r from-transparent via-ng-cyan/25 to-transparent" />
      <div className="absolute inset-x-[22%] top-[46%] h-24 -translate-y-full bg-gradient-to-t from-ng-brand/[0.09] to-transparent blur-2xl" />

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
 * form. One slab, one headline, two routes forward, standing on a grid floor
 * that runs off towards the horizon.
 */
export function CTASection() {
  const bandRef = useRef<HTMLDivElement>(null);

  // Drives the scene's camera drift. Passed to the scene as a motion value and
  // read inside its frame loop, so scrolling never re-renders this section.
  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ["start end", "end start"],
  });

  return (
    <Section label="Start a project" width="default" spacing="lg" backdrop={<CTAAmbience />}>
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

      {/* ── Closing band ──────────────────────────────────────────────────────
          The scene's own reserved box, below the slab and never behind it: the
          shared canvas is fixed above section content, so any geometry drawn
          over the heading or the buttons would cost real contrast on the last
          thing a prospective client reads.

          Full-bleed, because the floor's left and right edges have to be cut by
          the viewport rather than land as two vertical seams mid-page. The
          negative bottom margin lets it run into the section's own padding, so
          the floor dissolves at the boundary with the contact form instead of
          stopping in mid-air.
          ------------------------------------------------------------------ */}
      <div
        ref={bandRef}
        className={cn(
          "relative left-1/2 w-screen -translate-x-1/2",
          "mt-12 sm:mt-16 lg:mt-20",
          "-mb-16 sm:-mb-24 lg:-mb-32",
        )}
      >
        <SceneView
          className="h-[13rem] w-full sm:h-[16rem] lg:h-[19rem]"
          cameraPosition={[0, 1.3, 6]}
          cameraFov={45}
          fallback={<CTABandFallback />}
        >
          <CTAScene progress={scrollYProgress} />
        </SceneView>
      </div>
    </Section>
  );
}

export default CTASection;
