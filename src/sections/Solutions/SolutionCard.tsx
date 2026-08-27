import { useId, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "@/data/products";
import { productLinks } from "@/config/links";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Tag from "@/components/ui/Tag";
import { useIsTouch, usePrefersReducedMotion } from "@/hooks";

/**
 * Card footprint inside the editorial grid.
 *
 *   lg   — flagship, full copy, vertical
 *   md   — compact, tagline only, vertical
 *   wide — secondary platform, horizontal: copy left, module matrix right
 */
export type SolutionCardSize = "lg" | "md" | "wide";

/** Module chips shown before the "+N more" reveal kicks in. */
const PREVIEW_MODULES = 8;

/* ── Module matrix ──────────────────────────────────────────────────────────
 * The full module list, rendered like a spec sheet. The overflow reveals on
 * hover / focus-within for pointer users and via a real toggle for everyone
 * else — hover alone would strand the list on touch devices.
 * -------------------------------------------------------------------------- */

function ModuleMatrix({ product, className }: { product: Product; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const accent = accentOf(product.accent);

  const preview = product.modules.slice(0, PREVIEW_MODULES);
  const rest = product.modules.slice(PREVIEW_MODULES);

  return (
    <div className={cn(className)}>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ng-faint">
          Modules
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-ng-line" />
        <span className={cn("font-mono text-[0.625rem] tracking-[0.14em]", accent.text)}>
          {String(product.modules.length).padStart(2, "0")}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {preview.map((module) => (
          <Tag key={module} size="xs">
            {module}
          </Tag>
        ))}
      </div>

      {rest.length > 0 && (
        <>
          <div
            id={panelId}
            className={cn(
              "grid transition-[grid-template-rows,opacity] duration-[420ms] ease-ng",
              expanded
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100 group-focus-within/card:grid-rows-[1fr] group-focus-within/card:opacity-100",
            )}
          >
            <div className="overflow-hidden">
              <div className="ng-no-scrollbar mt-1.5 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto md:max-h-none md:overflow-visible">
                {rest.map((module, i) => (
                  <span
                    key={module}
                    style={{ transitionDelay: `${Math.min(i, 10) * 26}ms` }}
                    className={cn(
                      "inline-flex translate-y-1 opacity-0 transition-[opacity,transform] duration-300 ease-ng",
                      expanded
                        ? "translate-y-0 opacity-100"
                        : "group-hover/card:translate-y-0 group-hover/card:opacity-100 group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100",
                    )}
                  >
                    <Tag size="xs">{module}</Tag>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            aria-label={
              expanded
                ? `Show fewer modules for ${product.name}`
                : `Show all ${product.modules.length} modules for ${product.name}`
            }
            onClick={() => setExpanded((value) => !value)}
            className="-ml-2 mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ng-muted transition-colors duration-300 hover:text-ng-cyan"
          >
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-3.5 transition-transform duration-[420ms] ease-ng",
                expanded && "rotate-180",
              )}
            />
            {expanded ? "Show fewer" : `+${rest.length} more`}
          </button>
        </>
      )}
    </div>
  );
}

/* ── Card ───────────────────────────────────────────────────────────────── */

export interface SolutionCardProps {
  product: Product;
  /** 1-based position, printed as the "01"–"06" spec-sheet index. */
  index: number;
  size?: SolutionCardSize;
  className?: string;
}

export function SolutionCard({ product, index, size = "md", className }: SolutionCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const isTouch = useIsTouch();
  const reducedMotion = usePrefersReducedMotion();

  const accent = accentOf(product.accent);
  const wide = size === "wide";
  const detailed = size === "lg" || wide;
  /** The pointer-tracked wash is meaningless without a fine pointer. */
  const tracksPointer = !isTouch && !reducedMotion;

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  const head = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-ng transition-transform duration-[420ms] ease-ng group-hover/card:-translate-y-0.5 group-hover/card:scale-105 group-focus-within/card:-translate-y-0.5",
            accent.chip,
          )}
        >
          <Icon name={product.icon} className="size-6" strokeWidth={1.6} />
        </span>
        <span
          aria-hidden="true"
          className={cn(
            "font-mono leading-none text-ng-faint",
            detailed ? "text-[2.25rem] sm:text-[2.75rem]" : "text-[1.75rem]",
          )}
        >
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <span className="mt-6 w-fit rounded-full border border-ng-line bg-white/[0.03] px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ng-muted">
        {product.category}
      </span>

      <h3
        className={cn(
          "mt-3 font-display font-semibold text-ng-fg",
          detailed ? "text-2xl" : "text-xl",
        )}
      >
        {product.name}
      </h3>

      <p className="mt-2 text-[0.9375rem] leading-relaxed text-ng-fg2">{product.tagline}</p>

      {detailed && (
        <p className="mt-3 text-sm leading-relaxed text-ng-muted">{product.description}</p>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {product.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </>
  );

  const cta = (
    <Button
      variant="ghost"
      size="sm"
      arrow="up"
      href={productLinks[product.link]}
      external
      requireConfigured
      className="-ml-4"
    >
      {product.cta}
    </Button>
  );

  return (
    <div
      className={cn(
        "group/card relative h-full transition-transform duration-[450ms] ease-ng hover:-translate-y-1 focus-within:-translate-y-1",
        className,
      )}
    >
      {/* Accent glow, behind the card so only the spill is visible. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-8 bottom-3 top-10 rounded-ng-lg opacity-0 transition-opacity duration-500 ease-ng group-hover/card:opacity-100 group-focus-within/card:opacity-100",
          accent.glow,
        )}
      />

      <article
        ref={cardRef}
        onPointerMove={tracksPointer ? handlePointerMove : undefined}
        className={cn(
          "ng-card relative h-full overflow-hidden rounded-ng-lg",
          // The secondary platform sits a step back from the flagships.
          wide && "bg-none bg-ng-surface/55",
        )}
      >
        {tracksPointer && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 ease-ng group-hover/card:opacity-100"
            style={{
              background: `radial-gradient(18rem 18rem at var(--mx, 50%) var(--my, 0%), ${accent.hex}26, transparent 70%)`,
            }}
          />
        )}

        {wide ? (
          <div className="relative flex h-full flex-col gap-8 p-6 sm:p-7 lg:flex-row lg:items-stretch lg:gap-12 lg:p-9">
            <div className="flex flex-col lg:w-[38%] lg:shrink-0">
              <span className={cn("mb-5 font-mono text-[0.625rem] uppercase tracking-[0.22em]", accent.text)}>
                Secondary platform
              </span>
              {head}
              <div className="mt-auto pt-7">{cta}</div>
            </div>

            <div className="lg:flex-1 lg:border-l lg:border-ng-line lg:pl-12">
              <ModuleMatrix product={product} />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "relative flex h-full flex-col p-6 sm:p-7",
              size === "lg" && "lg:p-9",
            )}
          >
            {head}
            <ModuleMatrix product={product} className="mt-7" />
            <div className="mt-auto pt-7">{cta}</div>
          </div>
        )}
      </article>
    </div>
  );
}

export default SolutionCard;
