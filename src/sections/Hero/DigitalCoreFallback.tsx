import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/* ============================================================================
 * NEXTGEN DIGITAL CORE — static visual
 * ----------------------------------------------------------------------------
 * Serves two jobs: the designed non-WebGL alternative, and the Suspense
 * fallback while the 3D chunk loads. It has to look finished in both, so it is
 * a real composition rather than a placeholder box.
 *
 * The module list lives here — the file carries no `three` import, so the 3D
 * scene can share it without dragging WebGL into the initial bundle.
 * ========================================================================== */

export const CORE_MODULES = [
  "ERP",
  "CRM",
  "HRMS",
  "AI",
  "ML",
  "CLOUD",
  "SAAS",
  "DATA",
] as const;

export type CoreModule = (typeof CORE_MODULES)[number];

/** Chip orbit radius, as a percentage of the square's width. Kept below 40 so
 *  a chip's own width never pushes past the container edge at 360px. */
const CHIP_RADIUS = 35;
/** The same orbit expressed in the 0–400 SVG space. */
const ORBIT_RADIUS = 140;
/** Waypoint markers sit on the inner ring, so the chips don't cover them. */
const WAYPOINT_RADIUS = 104;
const CENTRE = 200;

/** Half a step of rotation, so no chip lands on the exact top/bottom/side of
 *  the circle — it buys clearance for the overlapping terminal below. */
const ANGLE_OFFSET = Math.PI / CORE_MODULES.length;

const angleOf = (index: number) =>
  (index / CORE_MODULES.length) * Math.PI * 2 - Math.PI / 2 + ANGLE_OFFSET;

const hexPoints = (radius: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return `${(CENTRE + Math.cos(angle) * radius).toFixed(2)},${(CENTRE + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(" ");

const OUTER_HEX = hexPoints(58);
const INNER_HEX = hexPoints(36);

const ARIA_LABEL =
  "The NextGen digital core: a central platform ringed by its " +
  `${CORE_MODULES.join(", ")} modules.`;

export function DigitalCoreFallback({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label={ARIA_LABEL}
      className={cn("relative mx-auto aspect-square w-full max-w-[34rem]", className)}
    >
      <svg
        viewBox="0 0 400 400"
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 size-full"
      >
        <defs>
          <linearGradient id="ng-core-face" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-ng-brand-deep)" stopOpacity="0.85" />
            <stop offset="55%" stopColor="var(--color-ng-brand)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-ng-cyan)" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="ng-core-edge" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-ng-brand-soft)" />
            <stop offset="100%" stopColor="var(--color-ng-cyan)" />
          </linearGradient>
          <radialGradient id="ng-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-ng-brand)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--color-ng-brand)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient well behind the core */}
        <circle cx={CENTRE} cy={CENTRE} r="150" fill="url(#ng-core-glow)" />

        {/* Connection hairlines */}
        <g stroke="var(--color-ng-line2)" strokeWidth="1">
          {CORE_MODULES.map((module, index) => {
            const angle = angleOf(index);
            return (
              <line
                key={module}
                x1={CENTRE + Math.cos(angle) * 62}
                y1={CENTRE + Math.sin(angle) * 62}
                x2={CENTRE + Math.cos(angle) * ORBIT_RADIUS}
                y2={CENTRE + Math.sin(angle) * ORBIT_RADIUS}
                opacity={index % 2 === 0 ? 0.85 : 0.5}
              />
            );
          })}
        </g>

        {/* Orbit rings */}
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r="176"
          fill="none"
          stroke="var(--color-ng-line)"
          strokeWidth="1"
          strokeDasharray="3 12"
          className="animate-ng-dash"
        />
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r={ORBIT_RADIUS}
          fill="none"
          stroke="var(--color-ng-cyan)"
          strokeWidth="1"
          strokeOpacity="0.28"
          strokeDasharray="14 10"
          className="animate-ng-dash"
        />
        <circle
          cx={CENTRE}
          cy={CENTRE}
          r="104"
          fill="none"
          stroke="var(--color-ng-line)"
          strokeWidth="1"
          strokeOpacity="0.7"
        />

        {/* Waypoint markers where each connector crosses the inner ring */}
        <g>
          {CORE_MODULES.map((module, index) => {
            const angle = angleOf(index);
            const x = CENTRE + Math.cos(angle) * WAYPOINT_RADIUS;
            const y = CENTRE + Math.sin(angle) * WAYPOINT_RADIUS;
            return (
              <g key={module}>
                <circle cx={x} cy={y} r="7" fill="var(--color-ng-cyan)" opacity="0.12" />
                <circle cx={x} cy={y} r="2.6" fill="var(--color-ng-cyan)" />
              </g>
            );
          })}
        </g>

        {/* Faceted core */}
        <polygon
          points={OUTER_HEX}
          fill="url(#ng-core-face)"
          stroke="url(#ng-core-edge)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <polygon
          points={INNER_HEX}
          fill="none"
          stroke="var(--color-ng-cyan)"
          strokeWidth="1"
          strokeOpacity="0.45"
          strokeLinejoin="round"
          transform={`rotate(30 ${CENTRE} ${CENTRE})`}
        />
      </svg>

      {/* Breathing pulse around the core */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[36%] -translate-x-1/2 -translate-y-1/2 animate-ng-pulse-ring rounded-full border border-ng-cyan/35"
      />

      {/* Module chips */}
      {CORE_MODULES.map((module, index) => {
        const angle = angleOf(index);
        const style: CSSProperties = {
          left: `${50 + Math.cos(angle) * CHIP_RADIUS}%`,
          top: `${50 + Math.sin(angle) * CHIP_RADIUS}%`,
        };
        return (
          <span
            key={module}
            aria-hidden="true"
            style={style}
            className={cn(
              "ng-glass pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full",
              "px-2.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-ng-fg2",
              "sm:px-3 sm:text-[0.625rem]",
            )}
          >
            {module}
          </span>
        );
      })}
    </div>
  );
}

export default DigitalCoreFallback;
