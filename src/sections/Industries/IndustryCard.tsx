import Icon from "@/components/ui/Icon";
import { sectionIds } from "@/config/links";
import type { Industry } from "@/data/industries";
import type { Product } from "@/data/products";
import { getProduct } from "@/data/products";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";

export interface IndustryCardProps {
  industry: Industry;
  /** Wider, roomier treatment used by the two lead verticals in the first row. */
  featured?: boolean;
}

const microLabel = "font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ng-faint";

/**
 * One vertical: what it is, the friction it usually arrives with, and the
 * platforms that address it. Everything is legible at rest — hover and
 * focus-within only add emphasis, never information.
 */
export function IndustryCard({ industry, featured = false }: IndustryCardProps) {
  const linked = industry.products
    .map((id) => getProduct(id))
    .filter((product): product is Product => product !== undefined);

  const lead = accentOf(linked[0]?.accent ?? "brand");

  return (
    <article
      className={cn(
        "ng-card group/ind relative flex h-full flex-col overflow-hidden rounded-ng-card",
        "hover:-translate-y-1.5 hover:border-ng-line2 hover:shadow-ng-lift",
        "focus-within:-translate-y-1.5 focus-within:border-ng-line2 focus-within:shadow-ng-lift",
        featured ? "p-7 sm:p-8" : "p-6",
      )}
    >
      {/* Corner radial keyed to the first connected product. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-20 -top-20 -z-10 size-48 rounded-full blur-[52px]",
          "opacity-0 transition-opacity duration-700 ease-ng",
          "group-hover/ind:opacity-25 group-focus-within/ind:opacity-25",
        )}
        style={{ background: `radial-gradient(circle, ${lead.hex} 0%, transparent 70%)` }}
      />

      <div className="flex items-start gap-4">
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-ng",
            "transition-transform duration-500 ease-ng group-hover/ind:-translate-y-0.5",
            featured ? "size-14" : "size-11",
            lead.chip,
          )}
        >
          <Icon
            name={industry.icon}
            className={featured ? "size-6" : "size-5"}
            strokeWidth={1.6}
          />
        </span>

        <div className="min-w-0">
          <h3
            className={cn(
              "font-display font-semibold leading-snug text-ng-fg",
              featured ? "text-xl sm:text-2xl" : "text-lg",
            )}
          >
            {industry.name}
          </h3>
          <p
            className={cn(
              "mt-2 leading-relaxed text-ng-muted",
              featured ? "text-[0.9375rem]" : "text-sm",
            )}
          >
            {industry.blurb}
          </p>
        </div>
      </div>

      <div className={cn("mt-6 flex flex-1 flex-col gap-6", featured && "lg:flex-row lg:gap-8")}>
        <div className={cn(featured && "lg:flex-1")}>
          <p className={microLabel}>Typical friction</p>
          <ul className="mt-3 space-y-2">
            {industry.challenges.map((challenge) => (
              <li
                key={challenge}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-ng-fg2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-[0.5625rem] h-px w-3 shrink-0 bg-ng-faint",
                    "transition-colors duration-500 ease-ng group-hover/ind:bg-ng-cyan/70",
                  )}
                />
                <span className="min-w-0">{challenge}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={cn("mt-auto", featured && "lg:mt-0 lg:w-[46%] lg:shrink-0")}>
          <p className={microLabel}>Connected platforms</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {linked.map((product, i) => {
              const theme = accentOf(product.accent);
              return (
                <a
                  key={product.id}
                  href={`#${sectionIds.products}`}
                  aria-label={`${product.name} — see products`}
                  style={{ transitionDelay: `${i * 60}ms` }}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5",
                    "text-xs font-medium opacity-85",
                    "transition-[opacity,transform] duration-500 ease-ng",
                    // Expands the touch target to ~44px without changing the pill's look.
                    "after:absolute after:-inset-x-1 after:-inset-y-2 after:content-['']",
                    "hover:opacity-100 focus-visible:opacity-100",
                    "group-hover/ind:-translate-y-0.5 group-hover/ind:opacity-100",
                    "group-focus-within/ind:opacity-100",
                    theme.chip,
                  )}
                >
                  <Icon name={product.icon} className="size-3.5 shrink-0" strokeWidth={1.8} />
                  <span>{product.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

export default IndustryCard;
