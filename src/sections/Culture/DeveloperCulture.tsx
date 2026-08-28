import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import Section from "@/components/layout/Section";
import TechGlyph from "@/components/ui/TechGlyph";
import { Reveal } from "@/components/ui/Reveal";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";

/* ── Principles ──────────────────────────────────────────────────────────── */

const principles = [
  { label: "readable > clever", note: "code is read far more often than written" },
  { label: "ship small, ship often", note: "increments a reviewer can hold in their head" },
  { label: "every change reviewed", note: "nothing reaches main unread" },
  { label: "design for year three", note: "today's shortcut is next year's rewrite" },
] as const;

/* ── Syntax tokens ───────────────────────────────────────────────────────────
 * The snippet is built from structured tokens rather than a regex highlighter,
 * so the colouring is exact and the whole block stays a single flat array of
 * spans that React can render without parsing anything at runtime.
 * -------------------------------------------------------------------------- */

const KEYWORD = "text-ng-violet";
const IDENT = "text-ng-fg";
const KEY = "text-ng-cyan";
const STRING = "text-ng-emerald";
const PUNCT = "text-ng-muted";

interface Token {
  text: string;
  className: string;
}

function tok(text: string, className: string = PUNCT): Token {
  return { text, className };
}

/** `  key: ["a", "b"],` */
function arrayEntry(key: string, values: readonly string[]): Token[] {
  const tokens: Token[] = [tok("  "), tok(key, KEY), tok(': [')];
  values.forEach((value, index) => {
    tokens.push(tok(`"${value}"`, STRING));
    if (index < values.length - 1) tokens.push(tok(", "));
  });
  tokens.push(tok("],"));
  return tokens;
}

const codeLines: Token[][] = [
  [tok("const", KEYWORD), tok(" "), tok("nextGen", IDENT), tok(" = {")],
  arrayEntry("focus", ["ERP", "CRM", "HRMS", "AI", "SaaS", "Cloud"]),
  [],
  arrayEntry("technologies", [".NET", "React", "Node.js", "Python", "React Native"]),
  [],
  arrayEntry("databases", ["SQL", "PostgreSQL", "MongoDB", "Oracle"]),
  [],
  [
    tok("  "),
    tok("mission", KEY),
    tok(": "),
    tok('"Build technology that solves real problems."', STRING),
    tok(","),
  ],
  [tok("};")],
];

/** The line the caret sits on. */
const ACTIVE_LINE = codeLines.length - 1;

/** Plain-language stand-in for the code block, which is hidden from AT. */
const codeSummary =
  "Code sample: a configuration object named nextGen. Focus areas are ERP, CRM, HRMS, AI, SaaS and Cloud. " +
  "Technologies are .NET, React, Node.js, Python and React Native. Databases are SQL, PostgreSQL, MongoDB and Oracle. " +
  "The mission reads: build technology that solves real problems.";

/**
 * TechGlyph's own `size-6` default wins over any smaller `size-*` class passed
 * in (same specificity, later in Tailwind's sheet), so the tab glyph is sized
 * inline.
 */
const glyphSize = { width: "0.875rem", height: "0.875rem" } as const;

const lineVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Section ─────────────────────────────────────────────────────────────── */

export function DeveloperCulture() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Section
      width="default"
      spacing="lg"
      divider
      // This section writes its header inline rather than using SectionHeader,
      // so it names its landmark explicitly.
      aria-labelledby="culture-heading"
      backdrop={<Aura tone="violet" className="-bottom-40 right-0" size="size-[34rem]" opacity={16} />}
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        {/* ── Left: the argument ─────────────────────────────────────────── */}
        <div>
          <Reveal direction="up" duration={0.5}>
            <span className="ng-eyebrow mb-4">
              <span aria-hidden="true" className="h-px w-6 bg-gradient-to-r from-transparent to-ng-cyan" />
              14 — Engineering Culture
            </span>
          </Reveal>

          <Reveal direction="up" delay={0.06}>
            <h2
              id="culture-heading"
              className="text-balance font-display text-[clamp(1.75rem,1.1rem+2.6vw,3rem)] font-semibold leading-[1.08] text-ng-fg"
            >
              We Think In Systems, <span className="ng-gradient-text">We Ship In Code</span>
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.12}>
            <p className="mt-5 text-pretty text-[1.0625rem] leading-relaxed text-ng-muted">
              We work with a product mindset: decisions get written down, every change is reviewed
              before it merges, and the architecture is chosen for the version of the system that
              exists three years from now — not just the one being demoed next week.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.18}>
            <ul className="mt-9 overflow-hidden rounded-ng border border-ng-line bg-ng-surface/60">
              {principles.map((principle) => (
                <li
                  key={principle.label}
                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-ng-line px-4 py-3 first:border-t-0 sm:px-5"
                >
                  <span aria-hidden="true" className="font-mono text-sm text-ng-cyan">
                    ›
                  </span>
                  <span className="font-mono text-[0.8125rem] text-ng-fg2">{principle.label}</span>
                  <span className="font-mono text-[0.6875rem] text-ng-faint">// {principle.note}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ── Right: the editor ──────────────────────────────────────────── */}
        <Reveal direction="up" delay={0.1} scale>
          <figure className="relative m-0">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 -z-10 opacity-70"
            >
              <GridBackdrop density="fine" />
            </div>

            <div className="ng-glass overflow-hidden rounded-ng-card shadow-ng-lift">
              {/* Window chrome */}
              <div className="flex items-center gap-3 border-b border-ng-line bg-ng-surface/70 px-4 py-2.5">
                <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-ng-rose/70" />
                  <span className="size-2.5 rounded-full bg-ng-amber/70" />
                  <span className="size-2.5 rounded-full bg-ng-emerald/70" />
                </span>

                <span aria-hidden="true" className="ml-1 flex min-w-0 items-stretch gap-1 overflow-hidden">
                  <span className="flex min-w-0 items-center gap-2 rounded-t-ng-sm border-b-2 border-ng-cyan bg-ng-surface2 px-3 py-1.5">
                    <TechGlyph name="typescript" className="shrink-0 text-ng-cyan" style={glyphSize} />
                    <span className="truncate font-mono text-[0.6875rem] text-ng-fg2">nextgen.config.ts</span>
                  </span>
                  <span className="hidden min-w-0 items-center gap-2 px-3 py-1.5 sm:flex">
                    <TechGlyph name="typescript" className="shrink-0 text-ng-faint" style={glyphSize} />
                    <span className="truncate font-mono text-[0.6875rem] text-ng-faint">index.ts</span>
                  </span>
                </span>
              </div>

              {/* Code surface */}
              <div className="relative overflow-hidden bg-ng-void">
                {/* Soft scanline sweep across the code. */}
                {!reducedMotion && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 animate-ng-scan bg-gradient-to-b from-transparent via-ng-cyan/[0.06] to-transparent"
                  />
                )}

                <div aria-hidden="true" className="overflow-x-auto ng-no-scrollbar py-4">
                  <motion.div
                    /*
                     * `min-w-max` sizes this to the longest line so the block
                     * scrolls horizontally. On a phone that is the wrong trade:
                     * the widest line is ~70 characters against roughly 37 that
                     * fit, and `ng-no-scrollbar` hides the scrollbar, so the
                     * code simply looked chopped off with no hint it could be
                     * swiped. Below `sm` it shrinks to the container instead and
                     * the lines wrap.
                     */
                    className="min-w-0 sm:min-w-max"
                    variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
                    initial={reducedMotion ? "show" : "hidden"}
                    whileInView="show"
                    viewport={{ once: true, amount: 0.25 }}
                  >
                    {codeLines.map((tokens, line) => {
                      const active = line === ACTIVE_LINE;
                      return (
                        <motion.div
                          key={line}
                          variants={reducedMotion ? undefined : lineVariants}
                          className={cn("flex items-start", active && "bg-ng-brand/[0.07]")}
                        >
                          <span
                            className={cn(
                              // The gutter must stay opaque — it sits above the
                              // code as the block scrolls horizontally.
                              "sticky left-0 z-10 w-12 shrink-0 select-none bg-ng-void pr-4 text-right font-mono text-[0.6875rem] leading-7",
                              active ? "text-ng-fg2" : "text-ng-faint",
                            )}
                          >
                            {line + 1}
                          </span>

                          {/*
                            `min-w-0` is what actually lets this wrap: a flex
                            item refuses to shrink below its content width
                            without it, so the wrapping rules alone would be
                            ignored. Wrapping happens at the spaces after each
                            comma, which is where a formatter would break too.
                          */}
                          <code className="min-w-0 flex-1 whitespace-pre-wrap pr-4 font-mono text-[0.75rem] leading-7 sm:flex-none sm:whitespace-pre sm:pr-6 sm:text-[0.8125rem]">
                            {tokens.map((token, index) => (
                              <span key={index} className={token.className}>
                                {token.text}
                              </span>
                            ))}
                            {active && (
                              <span
                                className={cn(
                                  "ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[0.15em] bg-ng-cyan align-middle",
                                  !reducedMotion && "animate-ng-caret",
                                )}
                              />
                            )}
                          </code>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>

              {/* Status bar */}
              <div
                aria-hidden="true"
                className="flex items-center justify-between gap-4 border-t border-ng-line bg-ng-surface/70 px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ng-faint"
              >
                <span className="truncate">TypeScript · UTF-8 · LF</span>
                <span className="shrink-0 text-ng-muted">
                  Ln {ACTIVE_LINE + 1}, Col {codeLines[ACTIVE_LINE].reduce((n, t) => n + t.text.length, 0) + 1}
                </span>
              </div>
            </div>

            <figcaption className="sr-only">{codeSummary}</figcaption>
          </figure>
        </Reveal>
      </div>
    </Section>
  );
}

export default DeveloperCulture;
