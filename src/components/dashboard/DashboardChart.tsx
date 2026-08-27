/* ============================================================================
 * DASHBOARD CHART
 * ----------------------------------------------------------------------------
 * Combined bar + area chart drawn as inline SVG. The series arrives as 0–100
 * relative heights from `@/data/products`, so the geometry is pure arithmetic —
 * no charting dependency, no images.
 *
 * The viewBox is stretched with preserveAspectRatio="none" so the plot always
 * fills its card; every stroke carries `vector-effect="non-scaling-stroke"` so
 * line weights stay honest, and the point markers / axis labels are HTML rather
 * than SVG so they never inherit the horizontal stretch.
 *
 * ANIMATION CONTRACT — the resting state is the *visible* one.
 * Earlier this drew nothing whenever the entrance failed to fire: the plot sat
 * at an `initial="hidden"` variant (scaleY 0 / pathLength 0) waiting on a
 * `whileInView` that propagated through two non-motion SVG elements. Now every
 * mark renders at its final geometry by default and `animate` is only supplied
 * — as an explicit keyframe pair — once `useInView` has confirmed visibility.
 * If the observer never fires, or reduced motion is on, the chart is simply
 * drawn. Nothing about legibility depends on an animation completing.
 * ========================================================================== */

import { useId, useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { DashboardSpec } from "@/data/products";
import type { AccentTheme } from "@/lib/accent";
import { usePrefersReducedMotion } from "@/hooks";
import { cn } from "@/lib/cn";

/* Plot geometry, in viewBox units. */
const VB_W = 100;
const VB_H = 42;
const PLOT_TOP = 4;
const PLOT_BASE = 36;
const GRID_LINES = [4, 12, 20, 28, 36];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Point {
  x: number;
  y: number;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Catmull-Rom → cubic bézier. The 0.2 tension keeps the curve tame enough that
 * it never overshoots the plot area, which a full 0.5 tension would.
 */
function smoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  if (points.length < 3) {
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;
    const t = 0.2;
    const c1x = round(p1.x + (p2.x - p0.x) * t);
    const c1y = round(p1.y + (p2.y - p0.y) * t);
    const c2x = round(p2.x - (p3.x - p1.x) * t);
    const c2y = round(p2.y - (p3.y - p1.y) * t);
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export interface DashboardChartProps {
  chart: DashboardSpec["chart"];
  accent: AccentTheme;
  /** Play the entrance when the chart scrolls into view. */
  animate?: boolean;
  className?: string;
}

export function DashboardChart({ chart, accent, animate = true, className }: DashboardChartProps) {
  const reduced = usePrefersReducedMotion();
  const plotRef = useRef<HTMLDivElement>(null);
  const inView = useInView(plotRef, { once: true, amount: 0.2 });

  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const areaGradientId = `ng-chart-area-${uid}`;
  const barGradientId = `ng-chart-bar-${uid}`;

  const count = Math.max(1, Math.min(chart.series.length, chart.labels.length));
  const series = chart.series.slice(0, count);
  const labels = chart.labels.slice(0, count);

  const step = VB_W / count;
  const barWidth = round(step * 0.44);
  const points: Point[] = series.map((value, i) => ({
    x: round((i + 0.5) * step),
    y: round(PLOT_BASE - (Math.max(0, Math.min(100, value)) / 100) * (PLOT_BASE - PLOT_TOP)),
  }));

  const linePath = smoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${PLOT_BASE} L ${points[0].x} ${PLOT_BASE} Z`
      : "";

  const peak = series.reduce((best, value, i) => (value > series[best] ? i : best), 0);

  /* Undefined `animate` means "render as authored" — the safe resting state. */
  const playing = animate && !reduced && inView;

  return (
    <div
      className={cn(
        "flex flex-col rounded-ng border border-ng-line bg-ng-surface2/60 p-3",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[0.6875rem] font-medium text-ng-fg2">{chart.title}</span>
        <span className="shrink-0 font-mono text-[0.5625rem] text-ng-faint">
          {labels[0]} – {labels[count - 1]}
        </span>
      </div>

      <div ref={plotRef} className="relative mt-2.5 w-full">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          focusable="false"
          className="block h-24 w-full max-w-full @sm:h-28 @min-[40rem]:h-32"
        >
          <defs>
            <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent.hex} stopOpacity="0.42" />
              <stop offset="58%" stopColor={accent.hex} stopOpacity="0.11" />
              <stop offset="100%" stopColor={accent.hex} stopOpacity="0" />
            </linearGradient>
            <linearGradient id={barGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent.hex} stopOpacity="0.28" />
              <stop offset="100%" stopColor={accent.hex} stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Dashed baseline grid */}
          <g className="text-ng-line2">
            {GRID_LINES.map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2={VB_W}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray={y === PLOT_BASE ? undefined : "2 3"}
                opacity={y === PLOT_BASE ? 0.95 : 0.5}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {/* Faint bars behind the trend. They grow from the baseline; if the
              origin can't be measured they scale from centre — cosmetic only. */}
          {points.map((point, i) => (
            <motion.rect
              key={labels[i]}
              x={round(point.x - barWidth / 2)}
              y={point.y}
              width={barWidth}
              height={round(PLOT_BASE - point.y)}
              rx="0.7"
              fill={`url(#${barGradientId})`}
              style={{ originY: 1 }}
              animate={playing ? { scaleY: [0, 1], opacity: [0, 1] } : undefined}
              transition={{ duration: 0.5, delay: 0.04 + i * 0.045, ease: EASE }}
            />
          ))}

          {/* Area + smoothed trend line */}
          <motion.path
            d={areaPath}
            fill={`url(#${areaGradientId})`}
            style={{ originY: 1 }}
            animate={playing ? { scaleY: [0, 1], opacity: [0, 1] } : undefined}
            transition={{ duration: 0.75, delay: 0.1, ease: EASE }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke={accent.hex}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            animate={playing ? { pathLength: [0, 1], opacity: [0, 1] } : undefined}
            transition={{ duration: 1, delay: 0.1, ease: EASE }}
          />
        </svg>

        {/* Point markers live in HTML so they stay perfectly round. */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          animate={playing ? { opacity: [0, 1] } : undefined}
          transition={{ duration: 0.4, delay: 0.55, ease: EASE }}
        >
          {points.map((point, i) => (
            <span
              key={labels[i]}
              className="absolute size-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: `${point.x}%`,
                top: `${round((point.y / VB_H) * 100)}%`,
                backgroundColor: accent.hex,
                boxShadow: i === peak ? `0 0 0 3px ${accent.hex}2e` : undefined,
              }}
            />
          ))}
        </motion.div>
      </div>

      <div className="mt-2 flex">
        {labels.map((label) => (
          <span
            key={label}
            className="min-w-0 flex-1 truncate text-center font-mono text-[0.5625rem] text-ng-faint"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default DashboardChart;
