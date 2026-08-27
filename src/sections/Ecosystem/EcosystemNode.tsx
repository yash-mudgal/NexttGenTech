import type { KeyboardEvent } from "react";
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
  /** Pinned by a click / Enter. Drives `aria-selected`. */
  selected: boolean;
  /** Something else is active, so this one steps back. */
  dimmed: boolean;
  id: string;
  panelId: string;
  tabIndex: number;
  registerRef: (element: HTMLButtonElement | null) => void;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

export function EcosystemNode({
  node,
  x,
  y,
  active,
  selected,
  dimmed,
  id,
  panelId,
  tabIndex,
  registerRef,
  onHover,
  onSelect,
  onKeyDown,
}: EcosystemNodeProps) {
  return (
    <button
      ref={registerRef}
      id={id}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={tabIndex}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(node.id)}
      onKeyDown={onKeyDown}
      style={{ left: `${x}%`, top: `${y}%` }}
      className={cn(
        "absolute z-10 flex w-[5.75rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-ng px-1 py-2 text-center",
        "transition-[opacity,transform] duration-[420ms] ease-ng sm:w-[6.5rem]",
        dimmed ? "opacity-35" : "opacity-100",
        active && "scale-110",
      )}
    >
      <span
        className={cn(
          "ng-glass inline-flex size-11 items-center justify-center rounded-ng transition-all duration-[420ms] ease-ng sm:size-13",
          active ? node.accent.chip : "text-ng-fg2",
        )}
        style={active ? { boxShadow: `0 12px 34px -14px ${node.accent.hex}` } : undefined}
      >
        <Icon name={node.icon} className="size-5 sm:size-6" strokeWidth={1.6} />
      </span>

      <span
        className={cn(
          "font-mono text-[0.625rem] leading-tight tracking-[0.06em] transition-colors duration-300",
          active ? "text-ng-fg" : "text-ng-muted",
        )}
      >
        {node.label}
      </span>
    </button>
  );
}

export default EcosystemNode;
