import { ChevronDown } from "lucide-react";

import Tag from "@/components/ui/Tag";
import TechGlyph from "@/components/ui/TechGlyph";
import { databases } from "@/data/technologies";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";

/* ============================================================================
 * DATA ARCHITECTURE DIAGRAM
 * ----------------------------------------------------------------------------
 * Three stacked layers with SVG connector bands between them. Each band is its
 * own `preserveAspectRatio="none"` viewBox stretched to the container width, so
 * the fan re-proportions at every breakpoint without any measurement code.
 * Below `md` the bands are dropped entirely and the layers stack with chevrons.
 * ========================================================================== */

const applicationChips = [
  "School ERP",
  "Hospital ERP",
  "CRM",
  "HRMS",
  "Inventory",
  "Restaurant ERP",
];

const serviceChips = ["APIs", "Caching", "Reporting", "Backups", "Access Control", "Audit"];

/** Apps → services: six columns funnelling gently inward. */
const applicationFlow = [
  [8, 14],
  [24.4, 28.4],
  [40.8, 42.8],
  [57.2, 57.2],
  [73.6, 71.6],
  [90, 86],
] as const;

/**
 * Services → storage: one path per engine, landing above each node in the
 * four-column grid. Two extra crossing paths add depth without meaning.
 */
const storageFlow = [20, 40, 60, 80] as const;
const storageX = [12, 37.4, 62.6, 88] as const;
const crossFlow = [
  [40, 88],
  [60, 12],
] as const;

function tinted(tint: string, percent: number): string {
  return `color-mix(in oklab, ${tint} ${percent}%, transparent)`;
}

function fan(top: number, bottom: number): string {
  return `M ${top} 0 C ${top} 46, ${bottom} 56, ${bottom} 100`;
}

/**
 * Vertical brand→cyan flow gradient. Each band carries its own copy so no band
 * depends on a `<defs>` that lives inside a sibling SVG hidden by a breakpoint.
 */
function FlowGradient({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={accentOf("brand").hex} stopOpacity="0.15" />
        <stop offset="50%" stopColor={accentOf("cyan").hex} stopOpacity="0.6" />
        <stop offset="100%" stopColor={accentOf("brand").hex} stopOpacity="0.15" />
      </linearGradient>
    </defs>
  );
}

function LayerLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-2.5">
      <span className="font-mono text-[0.625rem] text-ng-cyan">{index}</span>
      <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ng-fg2">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="h-px flex-1 bg-gradient-to-r from-ng-line2 to-transparent"
      />
    </div>
  );
}

function LayerBar({ chips }: { chips: readonly string[] }) {
  return (
    <div className="ng-glass relative flex flex-wrap justify-center gap-2 overflow-hidden rounded-ng px-3 py-3.5 sm:px-5">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-ng-brand/70 via-ng-cyan/40 to-transparent"
      />
      {chips.map((chip) => (
        <Tag key={chip} size="xs">
          {chip}
        </Tag>
      ))}
    </div>
  );
}

/** Down-chevron shown instead of the connector bands on small screens. */
function StackChevron() {
  return (
    <div aria-hidden="true" className="flex justify-center py-3 md:hidden">
      <ChevronDown className="size-5 text-ng-faint" />
    </div>
  );
}

export interface DataArchitectureProps {
  /** Name of the database currently highlighted, or `null`. */
  activeDatabase: string | null;
  onDatabaseHover: (name: string | null) => void;
}

export function DataArchitecture({
  activeDatabase,
  onDatabaseHover,
}: DataArchitectureProps) {
  const activeIndex = databases.findIndex((db) => db.name === activeDatabase);

  return (
    <div className="relative lg:pl-12">
      <span className="absolute left-0 top-1/2 hidden -translate-y-1/2 font-mono text-[0.625rem] uppercase tracking-[0.32em] text-ng-faint [writing-mode:vertical-rl] lg:block">
        NextGen Data Layer
      </span>

      <div className="rounded-ng-card border border-ng-line bg-ng-surface/60 p-4 shadow-ng-card sm:p-6">
        <LayerLabel index="01" label="Business Applications" />
        <LayerBar chips={applicationChips} />

        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="hidden h-12 w-full md:block lg:h-16"
        >
          <FlowGradient id="ng-da-flow-apps" />
          {applicationFlow.map(([top, bottom]) => (
            <path
              key={top}
              d={fan(top, bottom)}
              fill="none"
              stroke="url(#ng-da-flow-apps)"
              strokeWidth={1.2}
              strokeDasharray="3 7"
              vectorEffect="non-scaling-stroke"
              className="animate-ng-dash"
            />
          ))}
        </svg>
        <StackChevron />

        <LayerLabel index="02" label="Data Services" />
        <LayerBar chips={serviceChips} />

        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="hidden h-14 w-full md:block lg:h-20"
        >
          <FlowGradient id="ng-da-flow-storage" />
          {crossFlow.map(([top, bottom]) => (
            <path
              key={`cross-${top}`}
              d={fan(top, bottom)}
              fill="none"
              stroke="url(#ng-da-flow-storage)"
              strokeWidth={1}
              strokeOpacity={0.35}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {storageFlow.map((top, index) => {
            const isActive = index === activeIndex;
            return (
              <path
                key={top}
                d={fan(top, storageX[index])}
                fill="none"
                stroke={isActive ? databases[index].tint : "url(#ng-da-flow-storage)"}
                strokeWidth={isActive ? 2 : 1.2}
                strokeDasharray="3 7"
                vectorEffect="non-scaling-stroke"
                className="animate-ng-dash transition-[stroke-width] duration-300"
              />
            );
          })}
        </svg>
        <StackChevron />

        <LayerLabel index="03" label="Storage" />
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
          {databases.map((db) => {
            const isActive = db.name === activeDatabase;
            return (
              <div
                key={db.name}
                onMouseEnter={() => onDatabaseHover(db.name)}
                onMouseLeave={() => onDatabaseHover(null)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-ng border border-ng-line bg-ng-surface2/80 px-2 py-3.5 text-center transition-colors duration-300",
                  !isActive && "hover:border-ng-line2",
                )}
                style={
                  isActive
                    ? {
                        borderColor: tinted(db.tint, 55),
                        boxShadow: `0 16px 44px -24px ${tinted(db.tint, 85)}`,
                      }
                    : undefined
                }
              >
                <span
                  className="grid size-9 place-items-center rounded-ng-sm transition-transform duration-300"
                  style={{
                    backgroundColor: tinted(db.tint, isActive ? 22 : 12),
                    boxShadow: `inset 0 0 0 1px ${tinted(db.tint, isActive ? 45 : 24)}`,
                    transform: isActive ? "scale(1.08)" : undefined,
                  }}
                >
                  <TechGlyph
                    name={db.glyph}
                    style={{ color: db.tint, width: "1.375rem", height: "1.375rem" }}
                  />
                </span>
                <span className="font-display text-xs font-medium leading-tight text-ng-fg">
                  {db.name}
                </span>
                <span className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ng-faint">
                  {db.kind}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DataArchitecture;
