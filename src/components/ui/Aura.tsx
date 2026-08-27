import { cn } from "@/lib/cn";

export interface AuraProps {
  /** Colour family for the radial light. */
  tone?: "brand" | "cyan" | "violet";
  /** Positioning classes, e.g. "-top-40 left-1/4". */
  className?: string;
  /** Diameter classes, e.g. "size-[38rem]". Defaults to 32rem. */
  size?: string;
  /** 0–100. Lower for background ambience, higher for focal glows. */
  opacity?: number;
  /** Blur radius class. */
  blur?: string;
}

const tones = {
  brand: "ng-aura-brand",
  cyan: "ng-aura-cyan",
  violet: "ng-aura-violet",
} as const;

/**
 * Decorative ambient light. Purely presentational — always render inside an
 * aria-hidden, pointer-events-none layer (Section's `backdrop` prop does this).
 */
export function Aura({
  tone = "brand",
  className,
  size = "size-[32rem]",
  opacity = 22,
  blur = "blur-[90px]",
}: AuraProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("absolute rounded-full", tones[tone], size, blur, className)}
      style={{ opacity: opacity / 100 }}
    />
  );
}

export interface GridBackdropProps {
  /** "coarse" = 64px squares, "fine" = 22px. */
  density?: "coarse" | "fine";
  /** Mask the grid so it dissolves at the edges. */
  fade?: boolean;
  className?: string;
}

/** Blueprint grid backdrop. */
export function GridBackdrop({
  density = "coarse",
  fade = true,
  className,
}: GridBackdropProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0",
        density === "coarse" ? "ng-grid" : "ng-grid-fine",
        fade && "ng-fade-edges",
        className,
      )}
    />
  );
}

export default Aura;
