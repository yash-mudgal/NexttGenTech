import { useId } from "react";
import { cn } from "@/lib/cn";
import { company } from "@/config/company";

export interface LogoMarkProps {
  className?: string;
  /** Renders in a single flat colour instead of the brand gradient. */
  mono?: boolean;
  title?: string;
}

/**
 * The NG monogram, drawn as inline SVG.
 *
 * Vector rather than a bitmap so it stays crisp at every size, costs no
 * network request and can inherit colour. Swap this file's paths if an
 * official .svg export becomes available — nothing else needs to change.
 */
export function LogoMark({ className, mono = false, title }: LogoMarkProps) {
  const id = useId();
  const gradId = `ng-logo-${id}`;
  const stroke = mono ? "currentColor" : `url(#${gradId})`;

  return (
    <svg
      viewBox="0 0 72 64"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
      className={cn("shrink-0", className)}
    >
      {!mono && (
        <defs>
          <linearGradient id={gradId} x1="4" y1="52" x2="68" y2="8" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1a45d8" />
            <stop offset="52%" stopColor="#2f7bf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      )}

      {/* N — left stem */}
      <rect x="5" y="13" width="8.5" height="38" rx="4.25" fill={stroke} />

      {/* N — diagonal sweeping into the G */}
      <path
        d="M9.25 17 L31.5 47.5"
        fill="none"
        stroke={stroke}
        strokeWidth="8.5"
        strokeLinecap="round"
      />

      {/* G — bowl, right stem and crossbar as one continuous stroke */}
      <path
        d="M50.7 20.9 A13.5 13.5 0 1 0 51 43 L51 32 L44.5 32"
        fill="none"
        stroke={stroke}
        strokeWidth="8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pixel dissolve — the "next generation" motif from the brand mark */}
      <g fill={stroke}>
        <rect x="63" y="3" width="6.5" height="6.5" rx="1.8" />
        <rect x="55.5" y="9.5" width="5.5" height="5.5" rx="1.5" opacity="0.9" />
        <rect x="65" y="12" width="4.5" height="4.5" rx="1.2" opacity="0.8" />
        <rect x="58.5" y="17.5" width="3.2" height="3.2" rx="0.9" opacity="0.65" />
        <rect x="66.5" y="19" width="2.6" height="2.6" rx="0.8" opacity="0.5" />
      </g>
    </svg>
  );
}

export interface LogoProps {
  className?: string;
  /** Hide the wordmark and show only the monogram. */
  markOnly?: boolean;
  /** Wordmark scale. */
  size?: "sm" | "md" | "lg";
}

const markSizes = { sm: "h-7", md: "h-8", lg: "h-11" } as const;
const wordSizes = { sm: "text-base", md: "text-lg", lg: "text-2xl" } as const;
const subSizes = { sm: "text-[0.5rem]", md: "text-[0.5625rem]", lg: "text-[0.6875rem]" } as const;

/** Full lockup: monogram + NEXTGEN wordmark + "Software Technologies". */
export function Logo({ className, markOnly = false, size = "md" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={cn(markSizes[size], "w-auto")} title={`${company.name} logo`} />
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display font-bold tracking-[0.01em] text-ng-fg",
              wordSizes[size],
            )}
          >
            NEXT<span className="ng-gradient-text">GEN</span>
          </span>
          <span
            className={cn(
              "mt-1 font-mono uppercase tracking-[0.26em] text-ng-muted",
              subSizes[size],
            )}
          >
            {company.logoSub}
          </span>
        </span>
      )}
    </span>
  );
}

export default Logo;
