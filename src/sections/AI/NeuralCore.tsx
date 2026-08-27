import { useId, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import { aiNodes } from "@/data/ai";
import type { AiNode } from "@/data/ai";
import { usePrefersReducedMotion } from "@/hooks";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";

/* ============================================================================
 * NEURAL CORE — static visual
 * ----------------------------------------------------------------------------
 * The wheel the AI section used before the network became 3D. It is now
 * SceneView's fallback: the designed alternative for devices without WebGL and
 * for visitors who asked for reduced motion.
 *
 * Presentational only. It renders inside SceneView's `aria-hidden` box, so
 * nothing here may be focusable — the button list in AISection is the section's
 * single control surface, and it mirrors its state in through `activeId`.
 * ========================================================================== */

/* ── Geometry ────────────────────────────────────────────────────────────────
 * The diagram lives in a square container, so a single 1000×1000 viewBox maps
 * 1:1 onto both axes. Working at 1000 units rather than 100 also lets the
 * shared `animate-ng-dash` keyframe (a fixed −220 dashoffset) read as a slow,
 * steady flow instead of a blur.
 * -------------------------------------------------------------------------- */

/** Name of the central engine. Lives here — this file carries no `three`
 *  import, so the 3D scene can share it without pulling WebGL into the bundle. */
export const ENGINE_LABEL = "AI Engine";

const CENTRE = 500;
/** Radius of the node centres, in viewBox units. */
const NODE_R = 330;
/** Where a connector leaves the core disc. */
const CORE_EDGE = 138;
/** Where a connector meets the underside of a node pill. */
const NODE_EDGE = 282;
/** Dash period that divides the keyframe's −220 offset exactly, so it loops seamlessly. */
const DASH = "20 35";

interface NodePoint extends AiNode {
  /** Centre as a percentage of the square container. */
  left: number;
  top: number;
  /** Curved connector from the core out to the node. */
  spoke: string;
}

function polar(angle: number, radius: number): [number, number] {
  const rad = (angle * Math.PI) / 180;
  return [CENTRE + radius * Math.cos(rad), CENTRE + radius * Math.sin(rad)];
}

export interface NeuralCoreProps {
  /** Node currently hovered, focused or selected in AISection's button list. */
  activeId: string | null;
}

export function NeuralCore({ activeId }: NeuralCoreProps) {
  const gradientId = useId();
  const reducedMotion = usePrefersReducedMotion();

  const violet = accentOf("violet");
  const brand = accentOf("brand");
  const cyan = accentOf("cyan");

  const { points, links, mesh } = useMemo(() => {
    const nodes: NodePoint[] = aiNodes.map((node, index) => {
      const rad = (node.angle * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const [sx, sy] = polar(node.angle, CORE_EDGE);
      const [ex, ey] = polar(node.angle, NODE_EDGE);
      // Bow each spoke to the opposite side of its neighbour so the fan of
      // connectors reads as a web rather than a set of parallel spokes.
      const bow = index % 2 === 0 ? 42 : -42;
      const midR = (CORE_EDGE + NODE_EDGE) / 2;
      const cx = CENTRE + midR * cos - sin * bow;
      const cy = CENTRE + midR * sin + cos * bow;

      return {
        ...node,
        left: 50 + (NODE_R / 10) * cos,
        top: 50 + (NODE_R / 10) * sin,
        spoke: `M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`,
      };
    });

    const chord = (a: number, b: number) => {
      const [ax, ay] = polar(aiNodes[a].angle, NODE_R);
      const [bx, by] = polar(aiNodes[b].angle, NODE_R);
      return `M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}`;
    };

    const adjacent: string[] = [];
    const skipped: string[] = [];
    for (let i = 0; i < aiNodes.length; i += 1) {
      adjacent.push(chord(i, (i + 1) % aiNodes.length));
      skipped.push(chord(i, (i + 2) % aiNodes.length));
    }

    return { points: nodes, links: nodes.map((n) => n.spoke), mesh: { adjacent, skipped } };
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Focal glow behind the core. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full ng-aura-violet opacity-40 blur-[70px]" />

      {/* Connections, chords and travelling pulses. */}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1000 1000"
        className="pointer-events-none absolute inset-0 size-full"
      >
        <defs>
          <radialGradient
            id={`${gradientId}-link`}
            gradientUnits="userSpaceOnUse"
            cx={CENTRE}
            cy={CENTRE}
            r={NODE_R}
          >
            <stop offset="0%" stopColor={violet.hex} />
            <stop offset="55%" stopColor={brand.hex} />
            <stop offset="100%" stopColor={cyan.hex} />
          </radialGradient>
        </defs>

        {/* Faint mesh so the diagram reads as a network, not a wheel. */}
        <g fill="none" stroke={brand.hex} strokeLinecap="round">
          {mesh.skipped.map((d) => (
            <path key={`skip-${d}`} d={d} strokeWidth={1.6} opacity={0.09} />
          ))}
          {mesh.adjacent.map((d) => (
            <path key={`adj-${d}`} d={d} strokeWidth={2} opacity={0.16} />
          ))}
        </g>

        {points.map((node, index) => {
          const isActive = activeId === node.id;
          const isDimmed = activeId !== null && !isActive;
          return (
            <g
              key={node.id}
              className="transition-opacity duration-500"
              style={{ opacity: isDimmed ? 0.2 : 1 }}
            >
              <path
                d={links[index]}
                fill="none"
                stroke={`url(#${gradientId}-link)`}
                strokeLinecap="round"
                strokeDasharray={DASH}
                strokeWidth={isActive ? 6 : 3}
                opacity={isActive ? 1 : 0.62}
                className={cn(
                  "transition-[stroke-width,opacity] duration-500",
                  !reducedMotion && "animate-ng-dash",
                )}
              />
              {!reducedMotion && (
                <circle
                  r={isActive ? 8 : 5.5}
                  fill={cyan.hex}
                  opacity={isActive ? 1 : 0.7}
                  className="transition-[r,opacity] duration-500"
                >
                  <animateMotion
                    path={links[index]}
                    dur="3.4s"
                    begin={`${(index * 0.47).toFixed(2)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Rotating dashed ring around the core. */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 size-[38%] -translate-x-1/2 -translate-y-1/2",
          !reducedMotion && "animate-ng-spin-slow",
        )}
      >
        <svg viewBox="0 0 100 100" className="size-full">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={violet.hex}
            strokeWidth="0.7"
            strokeDasharray="1.5 5.5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      </div>

      {/* Core. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[27%] -translate-x-1/2 -translate-y-1/2">
        <div className="ng-glass flex size-full flex-col items-center justify-center gap-1.5 rounded-full text-center shadow-ng-glow">
          <Icon name="brain-circuit" className="size-6 text-ng-violet" strokeWidth={1.4} />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ng-fg">
            {ENGINE_LABEL}
          </span>
        </div>
      </div>

      {/* Nodes. */}
      {points.map((node) => {
        const isActive = activeId === node.id;
        const isDimmed = activeId !== null && !isActive;
        return (
          <span
            key={node.id}
            className="pointer-events-none absolute z-10"
            style={{ left: `${node.left}%`, top: `${node.top}%`, transform: "translate(-50%, -50%)" }}
          >
            <span
              className={cn(
                "flex max-w-[7.25rem] items-center gap-2 rounded-full border px-3 py-2",
                "backdrop-blur-md transition-[transform,opacity,color,background-color,border-color,box-shadow] duration-400",
                isActive
                  ? "scale-[1.07] border-ng-violet/50 bg-ng-violet/15 text-ng-fg shadow-ng-glow"
                  : "border-ng-line bg-ng-surface/80 text-ng-fg2",
                isDimmed && "opacity-45",
              )}
            >
              <span className="relative grid size-1.5 shrink-0 place-items-center">
                <span
                  className={cn(
                    "size-1.5 rounded-full transition-colors duration-300",
                    isActive ? "bg-ng-cyan" : "bg-ng-brand-soft",
                  )}
                />
                {isActive && !reducedMotion && (
                  <span className="absolute size-3 animate-ng-pulse-ring rounded-full bg-ng-cyan/40" />
                )}
              </span>
              <span className="text-left text-[0.6875rem] leading-tight font-medium">
                {node.label}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

export default NeuralCore;
