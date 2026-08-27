import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { CornerDownLeft } from "lucide-react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Icon from "@/components/ui/Icon";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { aiEngineeringPractices, aiWorkflow } from "@/data/ai";
import type { WorkflowStage } from "@/data/ai";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";

/**
 * The pipeline wraps at two breakpoints: 2-up from `sm`, 4-up from `lg`. A
 * stage that ends a row must not draw a connector into the next one, and which
 * stages those are differs per breakpoint — hence three fixed class bundles
 * rather than one composed string (conflicting variants would fight in the
 * cascade).
 */
function connectorVisibility(index: number): string {
  const endsSmRow = index % 2 === 1;
  const endsLgRow = index % 4 === 3;
  if (endsSmRow && endsLgRow) return "hidden";
  if (endsSmRow) return "hidden lg:block";
  return "hidden sm:block";
}

interface PipelineStageProps {
  stage: WorkflowStage;
  index: number;
  /** Scroll progress through the pipeline, 0–1. */
  progress: MotionValue<number>;
  reducedMotion: boolean;
}

function PipelineStage({ stage, index, progress, reducedMotion }: PipelineStageProps) {
  // Each stage lights up over its own slice of the scroll, so the pipeline
  // fills left-to-right as the section passes through the viewport.
  const start = index * 0.085;
  const scrollLit = useTransform(progress, [start, start + 0.16], [0, 1]);
  const lit = reducedMotion ? 1 : scrollLit;

  const number = String(index + 1).padStart(2, "0");

  return (
    <li className="group/stage relative pl-12 sm:pl-0">
      {/* Mobile timeline marker. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[1.125rem] top-7 size-3 -translate-x-1/2 rounded-full border border-ng-line2 bg-ng-surface sm:hidden"
      >
        <motion.span
          style={{ opacity: lit }}
          className="absolute inset-[0.1875rem] rounded-full bg-gradient-to-br from-ng-violet to-ng-cyan"
        />
      </span>

      {/* Connector into the next stage. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-full top-10 h-px w-5 -translate-y-1/2 bg-ng-line",
          connectorVisibility(index),
        )}
      >
        <motion.span
          style={{ scaleX: lit }}
          className="absolute inset-0 origin-left bg-gradient-to-r from-ng-violet to-ng-cyan"
        />
        <span className="absolute right-0 top-1/2 size-1.5 -translate-y-1/2 rotate-45 border-r border-t border-ng-line2 transition-colors duration-500 group-hover/stage:border-ng-cyan" />
        {!reducedMotion && (
          <motion.span
            className="absolute inset-0"
            animate={{ x: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.9,
              repeat: Infinity,
              repeatDelay: 0.5,
              delay: index * 0.24,
              ease: "linear",
            }}
          >
            <span className="absolute left-0 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ng-cyan ring-2 ring-ng-cyan/25" />
          </motion.span>
        )}
      </span>

      {/* Row wrap indicator — row 1 continues from the left of row 2 at `lg`.
          It sits inside the row gap, never past the grid's right edge. */}
      {index === 3 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-9 right-2 hidden items-center gap-1.5 font-mono text-[0.625rem] tracking-[0.16em] text-ng-faint lg:flex"
        >
          continues
          <CornerDownLeft className="size-3.5" strokeWidth={1.5} />
        </span>
      )}

      <div className="relative flex h-full flex-col rounded-ng-card border border-ng-line bg-ng-surface/70 p-5 transition-[transform,border-color,box-shadow] duration-500 group-hover/stage:-translate-y-1 group-hover/stage:border-ng-line2 group-hover/stage:shadow-ng-lift group-focus-within/stage:-translate-y-1 group-focus-within/stage:border-ng-line2">
        <motion.span
          aria-hidden="true"
          style={{ opacity: lit }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-ng-violet/35 bg-gradient-to-b from-ng-violet/[0.08] to-transparent"
        />

        <div className="relative flex items-start gap-3">
          <span className="relative grid size-10 shrink-0 place-items-center rounded-ng border border-ng-line bg-white/[0.03]">
            <motion.span
              aria-hidden="true"
              style={{ opacity: lit }}
              className="absolute inset-0 rounded-[inherit] border border-ng-violet/40 bg-gradient-to-br from-ng-violet/20 to-ng-cyan/10"
            />
            <Icon name={stage.icon} className="relative size-[1.125rem] text-ng-faint" strokeWidth={1.6} />
            <motion.span style={{ opacity: lit }} className="absolute inset-0 grid place-items-center">
              <Icon name={stage.icon} className="size-[1.125rem] text-ng-cyan" strokeWidth={1.6} />
            </motion.span>
          </span>

          <div className="min-w-0">
            <span className="block font-mono text-[0.6875rem] tracking-[0.18em] text-ng-faint">
              {number}
            </span>
            <h3 className="mt-1 font-display text-[0.9375rem] font-semibold leading-tight text-ng-fg">
              {stage.label}
            </h3>
          </div>
        </div>

        <p className="relative mt-3.5 text-[0.8125rem] leading-relaxed text-ng-muted">
          {stage.detail}
        </p>
      </div>
    </li>
  );
}

export function AIWorkflow() {
  const pipelineRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: pipelineRef,
    offset: ["start 0.9", "end 0.5"],
  });

  return (
    <Section
      width="wide"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop density="fine" />
          <Aura tone="violet" className="right-[-8rem] top-1/3" size="size-[36rem]" opacity={12} />
        </>
      }
    >
      <SectionHeader
        align="left"
        eyebrow="07 — Engineering Practice"
        title="Engineering With"
        highlight="AI at the Core"
        description="AI-assisted tooling is part of how the team works day to day — from planning through to deployment — and every change is still read and reviewed by an engineer before it merges."
      />

      {/* ── Pipeline ────────────────────────────────────────────────────── */}
      <div ref={pipelineRef} className="relative mt-14 lg:mt-20">
        {/* Mobile timeline rail. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 left-[1.125rem] top-8 w-px bg-gradient-to-b from-ng-violet via-ng-brand to-ng-cyan opacity-45 sm:hidden"
        />

        <ol className="grid gap-y-5 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4 lg:gap-y-16">
          {aiWorkflow.map((stage, index) => (
            <PipelineStage
              key={stage.id}
              stage={stage}
              index={index}
              progress={scrollYProgress}
              reducedMotion={reducedMotion}
            />
          ))}
        </ol>
      </div>

      {/* ── Practices ───────────────────────────────────────────────────── */}
      <div className="mt-16 grid gap-8 lg:mt-24 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:gap-14">
        <Reveal direction="up">
          <div>
            <span className="ng-eyebrow">
              <span
                aria-hidden="true"
                className="h-px w-6 bg-gradient-to-r from-transparent to-ng-cyan"
              />
              Day to day
            </span>
            <h3 className="mt-4 font-display text-[clamp(1.25rem,1rem+1.1vw,1.75rem)] font-semibold leading-tight text-ng-fg">
              What that looks like in the repository
            </h3>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ng-muted">
              These are tools inside an engineering workflow, not autonomous systems — an engineer
              owns, reviews and signs off every change that reaches production.
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.08}>
          <div className="ng-glass overflow-hidden rounded-ng-card shadow-ng-card">
            <div className="flex items-center gap-2 border-b border-ng-line bg-white/[0.02] px-4 py-2.5">
              <span aria-hidden="true" className="flex gap-1.5">
                <span className="size-2 rounded-full bg-ng-rose/45" />
                <span className="size-2 rounded-full bg-ng-amber/45" />
                <span className="size-2 rounded-full bg-ng-emerald/45" />
              </span>
              <span className="ml-2 font-mono text-[0.6875rem] tracking-[0.14em] text-ng-faint">
                nextgen/engineering — practices
              </span>
            </div>

            <Stagger
              as="ul"
              gap={0.06}
              className="space-y-2.5 px-5 py-5 font-mono text-[0.8125rem] sm:px-6"
            >
              {aiEngineeringPractices.map((practice) => (
                <StaggerItem as="li" key={practice} className="flex items-start gap-3">
                  <span aria-hidden="true" className="leading-relaxed text-ng-emerald">
                    ✓
                  </span>
                  <span className="leading-relaxed text-ng-fg2">{practice}</span>
                </StaggerItem>
              ))}
              <StaggerItem as="li" className="flex items-start gap-3 pt-1">
                <span aria-hidden="true" className="leading-relaxed text-ng-faint">
                  ›
                </span>
                <span className="leading-relaxed text-ng-faint">
                  reviewed_by: engineer
                  {!reducedMotion && (
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block h-3.5 w-1.5 translate-y-[0.15rem] animate-ng-caret bg-ng-cyan"
                    />
                  )}
                </span>
              </StaggerItem>
            </Stagger>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default AIWorkflow;
