/* ============================================================================
 * PRODUCT CARD
 * ----------------------------------------------------------------------------
 * One slide of the product showcase: the platform's story on the left, a live
 * hand-built dashboard mockup on the right, tilted slightly in 3D at rest and
 * easing toward flat on hover.
 *
 * The tilt is dropped for coarse pointers and for reduced-motion visitors.
 * ========================================================================== */

import type { Product } from "@/data/products";
import { productLinks } from "@/config/links";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";
import { useIsTouch, usePrefersReducedMotion } from "@/hooks";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import Tag from "@/components/ui/Tag";
import DashboardPreview from "@/components/dashboard/DashboardPreview";

/** How many module names are spelled out before the "+N more" tail. */
const MODULE_PREVIEW = 5;

export interface ProductCardProps {
  product: Product;
  /** Zero-based position, rendered as the "01 / 06" counter. */
  index: number;
  total: number;
  /** True when this is the slide currently centred in the rail. */
  active: boolean;
}

export function ProductCard({ product, index, total, active }: ProductCardProps) {
  const accent = accentOf(product.accent);
  const isTouch = useIsTouch();
  const reduced = usePrefersReducedMotion();
  const tilt = !isTouch && !reduced;

  const preview = product.modules.slice(0, MODULE_PREVIEW);
  const remaining = product.modules.length - preview.length;

  return (
    <article
      className={cn(
        "ng-card group relative h-full overflow-hidden rounded-ng-xl p-5 sm:p-7 lg:p-8",
        active && "border-ng-line2 shadow-ng-card",
      )}
    >
      {/* Accent wash in the corner + hairline along the top edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 -z-10 size-72 rounded-full opacity-25 blur-[70px]"
        style={{ background: `radial-gradient(circle, ${accent.hex}, transparent 68%)` }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent.hex}80, transparent)` }}
      />

      <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,38fr)_minmax(0,62fr)] lg:gap-9">
        {/* ── Info ─────────────────────────────────────────────────────── */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.14em]",
                accent.chip,
              )}
            >
              <Icon name={product.icon} className="size-3.5 shrink-0" strokeWidth={1.75} />
              <span className="truncate">{product.category}</span>
            </span>
            <span className="ml-auto shrink-0 font-mono text-[0.625rem] text-ng-faint">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          </div>

          <h3 className="mt-4 font-display text-[clamp(1.5rem,1.05rem+1.5vw,2.25rem)] font-semibold leading-[1.1] text-ng-fg">
            {product.name}
          </h3>

          <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ng-fg2">{product.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-ng-muted">{product.description}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <Tag key={tag} size="xs" dot={accent.hex}>
                {tag}
              </Tag>
            ))}
          </div>

          <div className="mt-5 rounded-ng border border-ng-line bg-ng-void/40 p-3">
            <div className="flex items-center gap-2.5">
              <span className="shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ng-faint">
                Modules ·{" "}
                <span className="font-medium" style={{ color: accent.hex }}>
                  {product.modules.length}
                </span>
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-ng-line" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ng-muted">
              {preview.join(" · ")}
              {remaining > 0 && <span className="text-ng-faint"> · +{remaining} more</span>}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Button
              variant="primary"
              arrow="up"
              href={productLinks[product.link]}
              external
              requireConfigured
            >
              {product.cta}
            </Button>
            <Button variant="ghost" arrow="right" href="#contact">
              Talk to us
            </Button>
          </div>
        </div>

        {/* ── Dashboard mockup ─────────────────────────────────────────── */}
        <div className="ng-perspective relative min-w-0">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-8 -z-10 rounded-full opacity-30 blur-[60px]"
            style={{ background: `radial-gradient(ellipse at center, ${accent.hex}, transparent 70%)` }}
          />
          <div
            className={cn(
              "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
              tilt &&
                "[transform:rotateY(-8deg)_rotateX(3deg)_scale(0.96)] group-hover:[transform:rotateY(0deg)_rotateX(0deg)_scale(1)]",
            )}
          >
            <DashboardPreview product={product} />
          </div>
          <p className="sr-only">
            An illustrative interface mockup of the {product.name} dashboard, showing the{" "}
            {product.dashboard.nav[0]?.toLowerCase() ?? "overview"} screen with sample figures.
          </p>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
