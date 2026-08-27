import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks";

/* ── Script ───────────────────────────────────────────────────────────────────
 * The terminal is a *picture* of a boot sequence, not a real shell. Keeping the
 * script declarative means the row count is known up front, so the body height
 * can be reserved and the surrounding layout never shifts as lines land.
 * -------------------------------------------------------------------------- */

const COMMAND = "nextgen init enterprise";

const STEPS = [
  "Loading business architecture...",
  "Initializing ERP...",
  "Connecting CRM...",
  "Activating HRMS...",
  "Syncing Inventory...",
  "Integrating AI...",
  "Connecting Cloud...",
] as const;

const RESULTS = [
  "System Architecture Ready",
  "AI Layer Connected",
  "Business Automation Enabled",
] as const;

const OUTPUT_LINES = STEPS.length + RESULTS.length;

/** Command characters per tick, and the pause before / between output lines. */
const TYPE_MS = 44;
const LEAD_IN_MS = 420;
const AFTER_COMMAND_MS = 380;
const STEP_MS = 210;
const RESULT_MS = 330;

const ARIA_LABEL =
  `Terminal illustration. The command "${COMMAND}" runs, ` +
  `bringing up ${STEPS.length} platform services and reporting: ` +
  `${RESULTS.join(", ")}.`;

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="animate-ng-caret ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] bg-ng-cyan"
    />
  );
}

export function HeroTerminal({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.35 });
  const reducedMotion = usePrefersReducedMotion();

  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      setCharCount(COMMAND.length);
      setLineCount(OUTPUT_LINES);
      return;
    }

    let timer = 0;
    let chars = 0;
    let lines = 0;

    const nextLine = () => {
      lines += 1;
      setLineCount(lines);
      if (lines < OUTPUT_LINES) {
        timer = window.setTimeout(nextLine, lines < STEPS.length ? STEP_MS : RESULT_MS);
      }
    };

    const nextChar = () => {
      chars += 1;
      setCharCount(chars);
      timer =
        chars < COMMAND.length
          ? window.setTimeout(nextChar, TYPE_MS)
          : window.setTimeout(nextLine, AFTER_COMMAND_MS);
    };

    timer = window.setTimeout(nextChar, LEAD_IN_MS);
    return () => window.clearTimeout(timer);
  }, [inView, reducedMotion]);

  const typing = charCount < COMMAND.length;

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={ARIA_LABEL}
      className={cn(
        "ng-glass overflow-hidden rounded-ng-card shadow-ng-lift",
        className,
      )}
    >
      {/* Title bar */}
      <div className="flex items-center gap-3 border-b border-ng-line bg-white/[0.02] px-4 py-2.5">
        <span aria-hidden="true" className="flex shrink-0 items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-ng-rose/80" />
          <span className="size-2.5 rounded-full bg-ng-amber/80" />
          <span className="size-2.5 rounded-full bg-ng-emerald/80" />
        </span>
        <span
          aria-hidden="true"
          className="min-w-0 flex-1 truncate text-center font-mono text-[0.6875rem] tracking-tight text-ng-muted sm:text-xs"
        >
          nextgen@core: ~/enterprise
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 rounded-full border border-ng-line px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ng-faint"
        >
          bash
        </span>
      </div>

      {/* Body — height reserved for every row up front. */}
      <div
        aria-hidden="true"
        className="relative h-[20rem] overflow-hidden px-4 py-4 font-mono text-xs leading-[1.55] sm:h-[21.5rem] sm:px-5 sm:text-[0.8125rem]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ng-cyan/[0.06] to-transparent"
        />

        <div className="relative">
          {/* Command */}
          <p className="whitespace-pre-wrap break-words">
            <span className="text-ng-cyan">$</span>{" "}
            <span className="text-ng-fg">{COMMAND.slice(0, charCount)}</span>
            {typing && <Caret />}
          </p>

          <p className="h-[1.55em]" />

          {STEPS.map((step, index) => (
            <p
              key={step}
              className={cn(
                "whitespace-pre-wrap break-words text-ng-muted",
                "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                lineCount > index ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
              )}
            >
              <span className="text-ng-faint">&gt;</span> {step}
            </p>
          ))}

          <p className="h-[1.55em]" />

          {RESULTS.map((result, index) => (
            <p
              key={result}
              className={cn(
                "whitespace-pre-wrap break-words text-ng-emerald",
                "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                lineCount > STEPS.length + index
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0",
              )}
            >
              <span aria-hidden="true">✓</span> {result}
            </p>
          ))}

          <p className="h-[1.55em]" />

          {/* Prompt returns — the caret rests here for the rest of the visit. */}
          <p className={cn("transition-opacity duration-300", typing ? "opacity-0" : "opacity-100")}>
            <span className="text-ng-cyan">$</span>
            <Caret />
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroTerminal;
