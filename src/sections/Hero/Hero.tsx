import { lazy } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { company } from "@/config/company";
import { sectionIds } from "@/config/links";
import SceneView from "@/components/3d/SceneView";
import HeroTerminal from "./HeroTerminal";
import DigitalCoreFallback from "./DigitalCoreFallback";

/* Everything `three` stays behind this boundary so it never touches the
 * initial bundle. SceneView renders it into the site's shared WebGL canvas. */
const DigitalCoreScene = lazy(() => import("./DigitalCore"));

const EASE = [0.22, 1, 0.36, 1] as const;

const column: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.62, ease: EASE } },
};

/* The tagline's closing phrase carries the brand gradient. Split from config
 * rather than hardcoded so editing company.tagline stays a one-file change. */
const TAGLINE_WORDS = company.tagline.trim().split(/\s+/);
const TAGLINE_LEAD = TAGLINE_WORDS.slice(0, -2).join(" ");
const TAGLINE_ACCENT = TAGLINE_WORDS.slice(-2).join(" ");

export function Hero() {
  return (
    <Section
      id={sectionIds.home}
      width="wide"
      spacing="md"
      // The hero writes its own <h1> rather than using SectionHeader, so it
      // names its landmark explicitly instead of via the header context.
      aria-labelledby="hero-heading"
      className="flex min-h-[92svh] items-center pt-28 sm:pt-32 lg:pt-36"
      backdrop={
        <>
          <GridBackdrop />
          <Aura tone="brand" size="size-[44rem]" opacity={20} className="-left-56 -top-64" />
          <Aura tone="cyan" size="size-[34rem]" opacity={15} className="-right-40 top-24" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,transparent_20%,var(--color-ng-ink)_100%)]" />
        </>
      }
    >
      <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 xl:gap-14">
        {/* ── Copy ─────────────────────────────────────────────────────── */}
        <motion.div variants={column} initial="hidden" animate="show">
          <motion.p variants={item} className="flex">
            <span className="ng-glass inline-flex max-w-full items-center gap-2.5 rounded-full px-3 py-1.5 sm:px-3.5">
              <span aria-hidden="true" className="relative flex size-2 shrink-0">
                <span className="absolute inline-flex size-full animate-ng-pulse-ring rounded-full bg-ng-emerald/70" />
                <span className="relative inline-flex size-2 rounded-full bg-ng-emerald" />
              </span>
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-ng-fg2 sm:text-[0.6875rem] sm:tracking-[0.18em]">
                Software Engineering · ERP · AI · Cloud
              </span>
            </span>
          </motion.p>

          <motion.h1
            id="hero-heading"
            variants={item}
            // Tuned down from a 4.5rem cap: at ~1280px the old curve hit its
            // maximum and wrapped the headline onto five lines, pushing the
            // CTAs below the fold on a short laptop viewport.
            className="mt-6 font-display text-[clamp(2.125rem,1rem+3.4vw,4rem)] font-semibold leading-[1.04] text-ng-fg"
          >
            {TAGLINE_LEAD}{" "}
            <span className="ng-gradient-text">{TAGLINE_ACCENT}</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 font-mono text-[0.6875rem] tracking-wide text-ng-cyan sm:text-xs"
          >
            {company.pitchLine}
          </motion.p>

          <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-ng-muted">
            {company.description}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" arrow="right" href={`#${sectionIds.solutions}`}>
              Explore Solutions
            </Button>
            <Button variant="secondary" size="lg" arrow="right" href={`#${sectionIds.products}`}>
              View Products
            </Button>
          </motion.div>

          <motion.ul variants={item} className="mt-9 flex flex-wrap items-center gap-y-2">
            {company.badges.map((badge, index) => (
              <li key={badge} className="flex items-center">
                {index > 0 && (
                  <span aria-hidden="true" className="mx-3 h-3 w-px bg-ng-line2 sm:mx-4" />
                )}
                <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ng-muted">
                  {badge}
                </span>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* ── Digital core + terminal ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="relative"
        >
          <div className="relative mx-auto w-full max-w-[34rem] lg:max-w-none">
            <SceneView
              className="mx-auto aspect-square w-full max-w-[34rem]"
              cameraPosition={[0, 0, 9]}
              cameraFov={45}
              fallback={<DigitalCoreFallback />}
            >
              <DigitalCoreScene />
            </SceneView>
          </div>

          {/* Overlaps the core's lower edge so the pair reads as one object. */}
          <div className="relative z-10 -mt-8 sm:-mt-12 lg:-ml-8 lg:-mt-12 xl:-ml-16 xl:-mt-16">
            <HeroTerminal />
          </div>
        </motion.div>
      </div>

      {/* ── Scroll cue ─────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none mt-16 hidden flex-col items-center gap-2 lg:flex"
      >
        <span className="relative h-14 w-px overflow-hidden bg-gradient-to-b from-transparent via-ng-line2 to-transparent">
          <span className="absolute inset-x-0 top-0 h-3 animate-ng-scan bg-gradient-to-b from-ng-cyan to-transparent" />
        </span>
        <ChevronDown className="size-4 animate-ng-float text-ng-faint" />
      </div>
    </Section>
  );
}

export default Hero;
