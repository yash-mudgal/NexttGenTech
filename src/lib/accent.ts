import type { Accent } from "@/data/products";

/**
 * Tailwind class bundles per accent colour.
 *
 * These are written out in full (never interpolated) so Tailwind's scanner can
 * see every class it needs to generate. Do NOT build accent classes with
 * template strings anywhere in the app — read them from here.
 */
export interface AccentTheme {
  /** Solid text colour. */
  text: string;
  /** Border colour at rest. */
  border: string;
  /** Tinted background wash. */
  bg: string;
  /** Icon chip: background + text + ring. */
  chip: string;
  /** Gradient used for bars, rails and underlines. */
  gradient: string;
  /** Ambient glow behind cards. */
  glow: string;
  /** Raw hex — for SVG strokes, canvas and inline styles. */
  hex: string;
  /** Slightly deeper hex for gradient stops. */
  hexDeep: string;
}

export const accents: Record<Accent, AccentTheme> = {
  brand: {
    text: "text-ng-brand-soft",
    border: "border-ng-brand/40",
    bg: "bg-ng-brand/10",
    chip: "bg-ng-brand/12 text-ng-brand-soft ring-1 ring-ng-brand/30",
    gradient: "from-ng-brand to-ng-cyan",
    glow: "shadow-[0_24px_70px_-28px_rgba(37,99,235,0.75)]",
    hex: "#2563eb",
    hexDeep: "#1a45d8",
  },
  cyan: {
    text: "text-ng-cyan",
    border: "border-ng-cyan/40",
    bg: "bg-ng-cyan/10",
    chip: "bg-ng-cyan/12 text-ng-cyan ring-1 ring-ng-cyan/30",
    gradient: "from-ng-cyan to-ng-brand",
    glow: "shadow-[0_24px_70px_-28px_rgba(34,211,238,0.7)]",
    hex: "#22d3ee",
    hexDeep: "#0ea5c9",
  },
  violet: {
    text: "text-ng-violet",
    border: "border-ng-violet/40",
    bg: "bg-ng-violet/10",
    chip: "bg-ng-violet/12 text-ng-violet ring-1 ring-ng-violet/30",
    gradient: "from-ng-violet to-ng-brand",
    glow: "shadow-[0_24px_70px_-28px_rgba(139,92,246,0.7)]",
    hex: "#8b5cf6",
    hexDeep: "#6d3fe0",
  },
  emerald: {
    text: "text-ng-emerald",
    border: "border-ng-emerald/40",
    bg: "bg-ng-emerald/10",
    chip: "bg-ng-emerald/12 text-ng-emerald ring-1 ring-ng-emerald/30",
    gradient: "from-ng-emerald to-ng-cyan",
    glow: "shadow-[0_24px_70px_-28px_rgba(52,211,153,0.6)]",
    hex: "#34d399",
    hexDeep: "#10b981",
  },
  amber: {
    text: "text-ng-amber",
    border: "border-ng-amber/40",
    bg: "bg-ng-amber/10",
    chip: "bg-ng-amber/12 text-ng-amber ring-1 ring-ng-amber/30",
    gradient: "from-ng-amber to-ng-rose",
    glow: "shadow-[0_24px_70px_-28px_rgba(251,191,36,0.55)]",
    hex: "#fbbf24",
    hexDeep: "#f59e0b",
  },
  rose: {
    text: "text-ng-rose",
    border: "border-ng-rose/40",
    bg: "bg-ng-rose/10",
    chip: "bg-ng-rose/12 text-ng-rose ring-1 ring-ng-rose/30",
    gradient: "from-ng-rose to-ng-violet",
    glow: "shadow-[0_24px_70px_-28px_rgba(251,113,133,0.6)]",
    hex: "#fb7185",
    hexDeep: "#e11d48",
  },
};

export function accentOf(accent: Accent): AccentTheme {
  return accents[accent];
}
