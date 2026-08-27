import Section from "@/components/layout/Section";
import { GridBackdrop } from "@/components/ui/Aura";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { company } from "@/config/company";
import { useCountUp } from "@/hooks";
import { cn } from "@/lib/cn";

/**
 * `company.metrics.items` ships with deliberate "XX" placeholders — no figures
 * have been invented. Detect them locally so the band can present itself as
 * *awaiting data* rather than broken, and so the treatment disappears by itself
 * the moment real numbers are pasted into the config.
 */
function isPlaceholder(value: string): boolean {
  return /^X+$/i.test(value.trim());
}

interface MetricTileProps {
  value: string;
  suffix: string;
  label: string;
  hint: string;
}

/** Tile contents. The <li> itself is the StaggerItem that wraps this. */
function MetricTile({ value, suffix, label, hint }: MetricTileProps) {
  // useCountUp returns non-numeric values verbatim, so "XX" is never mangled
  // and the counter starts working the moment a real number lands in the config.
  const { ref, display } = useCountUp(value);
  const pending = isPlaceholder(value);
  const figure = `${display}${suffix}`;

  return (
    <>
      <p className="font-display text-[clamp(2rem,1.35rem+2.1vw,2.875rem)] font-semibold leading-none">
        <span ref={ref} className="relative inline-block">
          <span className={cn("ng-gradient-text", pending && "opacity-40")}>{figure}</span>

          {/* Placeholder shimmer, clipped to the glyphs — reads as "awaiting
              data" rather than as a rendering failure. */}
          {pending && (
            <span
              aria-hidden="true"
              className="ng-shimmer-bg pointer-events-none absolute inset-0 animate-ng-shimmer bg-clip-text text-transparent"
            >
              {figure}
            </span>
          )}
        </span>
      </p>

      <p className="mt-4 text-sm font-medium text-ng-fg2">{label}</p>
      <p className="mx-auto mt-1.5 max-w-[18rem] text-xs leading-relaxed text-ng-faint">{hint}</p>
    </>
  );
}

export function Metrics() {
  if (!company.metrics.enabled) return null;

  const items = company.metrics.items;
  const pending = items.some((item) => isPlaceholder(item.value));

  return (
    <Section width="default" spacing="md" label="Company metrics">
      <div className="relative overflow-hidden rounded-ng-lg">
        {/* Top + bottom hairlines only — the band should read as a rule across
            the page, not as a boxed panel. */}
        <div className="ng-glass relative border-x-0 border-y border-ng-line bg-ng-surface/30">
          {/* Very faint blueprint backdrop. It lives inside the glass panel so
              the panel's own backdrop-filter doesn't smear it. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50">
            <GridBackdrop density="fine" />
          </div>

          {/* The -1px offset lets the rounded wrapper clip the leading hairlines,
              so only the interior dividers survive — a stat band, not five cards. */}
          <Stagger
            as="ul"
            className="relative -ml-px -mt-px grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            gap={0.06}
          >
            {items.map((item) => (
              <StaggerItem
                key={item.label}
                as="li"
                className={cn(
                  "border-l border-t border-ng-line px-5 py-8 text-center sm:px-6 lg:py-10",
                  // Keeps the final row flush instead of leaving a dead cell.
                  "last:col-span-2 lg:last:col-span-1",
                )}
              >
                <MetricTile
                  value={item.value}
                  suffix={item.suffix}
                  label={item.label}
                  hint={item.hint}
                />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      {pending && (
        <p className="mt-5 text-center font-mono text-xs text-ng-faint">
          // placeholder figures — real numbers published once verified
        </p>
      )}
    </Section>
  );
}

export default Metrics;
