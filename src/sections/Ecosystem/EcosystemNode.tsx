import Icon from "@/components/ui/Icon";
import type { AccentTheme } from "@/lib/accent";
import { cn } from "@/lib/cn";

/**
 * One system on the ecosystem map. The six platforms are derived from
 * `@/data/products`; the shared layers are declared in ErpEcosystem.tsx.
 */
export interface EcoNode {
  id: string;
  label: string;
  /** Icon name from the registry in @/components/ui/Icon. */
  icon: string;
  /** Category line under the name, e.g. "ERP / Education". */
  kind: string;
  description: string;
  /** Heading above the chip list in the detail panel. */
  modulesLabel: string;
  modules: string[];
  accent: AccentTheme;
}

export interface EcosystemNodeProps {
  node: EcoNode;
  /** Centre of the node, as a percentage of the square map. */
  x: number;
  y: number;
  /** Hovered, focused or pinned — the node the detail panel is showing. */
  active: boolean;
  /** Something else is active, so this one steps back. */
  dimmed: boolean;
  /** Small map: drop the text label, which cannot fit nine times at 304px. */
  compact?: boolean;
}

/**
 * A marker on the static ecosystem map.
 *
 * Presentational only. The map is the 2D alternative rendered inside
 * `SceneView`'s `aria-hidden` box, so nothing in here may be focusable —
 * selection belongs to the tablist of real buttons in ErpEcosystem.
 */
export function EcosystemNode({ node, x, y, active, dimmed, compact = false }: EcosystemNodeProps) {
  return (
    <span
      style={{ left: `${x}%`, top: `${y}%` }}
      className={cn(
        "absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-ng px-1 py-2 text-center",
        "transition-[opacity,transform] duration-[420ms] ease-ng",
        compact ? "w-11" : "w-[5.75rem] sm:w-[6.5rem]",
        dimmed ? "opacity-35" : "opacity-100",
        active && "scale-110",
      )}
    >
      <span
        className={cn(
          "ng-glass inline-flex items-center justify-center rounded-ng transition-all duration-[420ms] ease-ng",
          compact ? "size-9" : "size-11 sm:size-13",
          active ? node.accent.chip : "text-ng-fg2",
        )}
        style={active ? { boxShadow: `0 12px 34px -14px ${node.accent.hex}` } : undefined}
      >
        <Icon
          name={node.icon}
          className={cn(compact ? "size-4" : "size-5 sm:size-6")}
          strokeWidth={1.6}
        />
      </span>

      {!compact && (
        <span
          className={cn(
            "font-mono text-[0.625rem] leading-tight tracking-[0.06em] transition-colors duration-300",
            active ? "text-ng-fg" : "text-ng-muted",
          )}
        >
          {node.label}
        </span>
      )}
    </span>
  );
}

export default EcosystemNode;
