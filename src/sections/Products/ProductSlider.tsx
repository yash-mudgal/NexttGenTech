/* ============================================================================
 * PRODUCT SLIDER
 * ----------------------------------------------------------------------------
 * A scroll-snap rail rather than a transform carousel: native touch swipe and
 * momentum come for free, the layout never fights the browser, and every slide
 * stays in the accessibility tree and in the tab order.
 *
 * Driven three ways — pointer drag, arrow buttons / pagination, and the
 * keyboard — with the active index read back from an IntersectionObserver so
 * the UI always reflects where the rail actually is.
 * ========================================================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "@/data/products";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks";
import Icon from "@/components/ui/Icon";
import ProductCard from "./ProductCard";

/** Pointer travel (px) past which the drag swallows the click that follows. */
const DRAG_THRESHOLD = 5;

interface RailButtonProps {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  className?: string;
}

function RailButton({ direction, disabled, onClick, className }: RailButtonProps) {
  const Glyph = direction === "prev" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous product" : "Next product"}
      className={cn(
        "ng-glass size-11 shrink-0 place-items-center rounded-full text-ng-fg2 shadow-ng-card",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "enabled:hover:border-ng-line2 enabled:hover:text-ng-fg enabled:hover:shadow-ng-lift",
        "disabled:cursor-not-allowed disabled:opacity-30",
        className,
      )}
    >
      <Glyph aria-hidden="true" className="size-4" strokeWidth={2} />
    </button>
  );
}

export interface ProductSliderProps {
  className?: string;
}

export function ProductSlider({ className }: ProductSliderProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detachDragRef = useRef<(() => void) | null>(null);
  const suppressClickRef = useRef(false);
  /** Pending "did the smooth scroll actually run?" check — see scrollToIndex. */
  const settleRef = useRef<number | undefined>(undefined);

  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);

  const reduced = usePrefersReducedMotion();
  const last = products.length - 1;

  /* ── Active slide tracking ─────────────────────────────────────────────
   * Ratios are accumulated across callbacks so the winner is always the most
   * visible slide, not merely the one that most recently crossed a threshold.
   * -------------------------------------------------------------------- */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || typeof IntersectionObserver === "undefined") return;

    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (Number.isNaN(index)) continue;
          ratios.set(index, entry.intersectionRatio);
        }

        let bestIndex = -1;
        let bestRatio = 0;
        ratios.forEach((ratio, index) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIndex = index;
          }
        });
        if (bestIndex >= 0) setActive(bestIndex);
      },
      { root: rail, threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] },
    );

    const slides = slideRefs.current.filter((el): el is HTMLDivElement => el !== null);
    slides.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const rail = railRef.current;
      const slide = slideRefs.current[index];
      if (!rail || !slide) return;

      const railBox = rail.getBoundingClientRect();
      const slideBox = slide.getBoundingClientRect();
      const left =
        rail.scrollLeft + (slideBox.left - railBox.left) - (rail.clientWidth - slide.clientWidth) / 2;

      if (reduced) {
        rail.scrollTo({ left, behavior: "auto" });
        return;
      }

      /*
       * Smooth scrolling is a request, not a guarantee — some browsers and
       * OS settings decline to animate, and the scroll then never happens at
       * all, leaving the arrows, arrow keys and pagination silently inert.
       * Ask for the animation, then check once shortly after whether the rail
       * actually moved toward the target, and hard-set the position if not.
       */
      const from = rail.scrollLeft;
      rail.scrollTo({ left, behavior: "smooth" });

      window.clearTimeout(settleRef.current);
      settleRef.current = window.setTimeout(() => {
        const current = rail.scrollLeft;
        const wanted = Math.abs(left - from);
        const moved = Math.abs(current - from);
        // Under 10% of the way after 140ms means the animation never started.
        if (wanted > 1 && moved < wanted * 0.1) {
          rail.scrollTo({ left, behavior: "auto" });
        }
      }, 140);
    },
    [reduced],
  );

  const step = useCallback(
    (delta: number) => {
      scrollToIndex(Math.min(last, Math.max(0, active + delta)));
    },
    [active, last, scrollToIndex],
  );

  /* ── Mouse drag ────────────────────────────────────────────────────────
   * Touch is left to the browser's own scrolling. Snapping is suspended for
   * the duration of the drag so the rail follows the pointer instead of
   * fighting it, then restored so it settles onto the nearest slide.
   * -------------------------------------------------------------------- */
  useEffect(
    () => () => {
      detachDragRef.current?.();
      window.clearTimeout(settleRef.current);
    },
    [],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    if (!rail || event.pointerType === "touch" || event.button !== 0) return;

    detachDragRef.current?.();
    suppressClickRef.current = false;

    const pointerId = event.pointerId;
    const startX = event.clientX;
    const startScroll = rail.scrollLeft;
    let travelled = 0;

    try {
      rail.setPointerCapture(pointerId);
    } catch {
      /* Pointer capture is a nicety; dragging still works without it. */
    }
    rail.style.scrollSnapType = "none";
    setDragging(true);

    const onMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const dx = moveEvent.clientX - startX;
      travelled = Math.max(travelled, Math.abs(dx));
      rail.scrollLeft = startScroll - dx;
    };

    const detach = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onFinish);
      window.removeEventListener("pointercancel", onFinish);
      try {
        rail.releasePointerCapture(pointerId);
      } catch {
        /* Already released. */
      }
      rail.style.scrollSnapType = "";
      detachDragRef.current = null;
      setDragging(false);
    };

    function onFinish(finishEvent: PointerEvent) {
      if (finishEvent.pointerId !== pointerId) return;
      if (travelled > DRAG_THRESHOLD) {
        suppressClickRef.current = true;
        window.getSelection()?.removeAllRanges();
      }
      detach();
    }

    detachDragRef.current = detach;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onFinish);
    window.addEventListener("pointercancel", onFinish);
  };

  /** A real drag must never fire the CTA underneath it. */
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        step(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        step(1);
        break;
      case "Home":
        event.preventDefault();
        scrollToIndex(0);
        break;
      case "End":
        event.preventDefault();
        scrollToIndex(last);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <RailButton
          direction="prev"
          disabled={active === 0}
          onClick={() => step(-1)}
          className="absolute left-0 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 lg:grid"
        />

        <div
          ref={railRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Product showcase"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onPointerDown={handlePointerDown}
          onClickCapture={handleClickCapture}
          onDragStart={(event) => event.preventDefault()}
          className={cn(
            "ng-no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3",
            "-mx-5 px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0",
            dragging ? "cursor-grabbing select-none" : "cursor-grab",
          )}
        >
          {products.map((product, i) => (
            <div
              key={product.id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
              data-index={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${products.length}: ${product.name}`}
              className={cn(
                // Fixed width, not min-width: as a `shrink-0` flex item a
                // min-width-only slide is still sized by its content, so any
                // descendant with a large max-content width (an SVG resolving
                // its intrinsic ratio, a nowrap row) inflates the whole rail.
                "w-[86vw] shrink-0 snap-center transition-opacity duration-500 sm:w-[70vw] lg:w-[46rem] xl:w-[52rem]",
                i === active ? "opacity-100" : "opacity-60",
              )}
            >
              <ProductCard
                product={product}
                index={i}
                total={products.length}
                active={i === active}
              />
            </div>
          ))}
        </div>

        <RailButton
          direction="next"
          disabled={active === last}
          onClick={() => step(1)}
          className="absolute right-0 top-1/2 z-20 hidden translate-x-1/2 -translate-y-1/2 lg:grid"
        />
      </div>

      {/* ── Pagination + compact arrows ──────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-0.5">
          {products.map((product, i) => {
            const accent = accentOf(product.accent);
            const isActive = i === active;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Show ${product.name}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex h-11 items-center justify-center px-1"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive
                      ? "w-9 md:hidden"
                      : "w-4 bg-ng-line2 group-hover:bg-ng-faint",
                  )}
                  style={
                    isActive
                      ? { background: `linear-gradient(90deg, ${accent.hexDeep}, ${accent.hex})` }
                      : undefined
                  }
                />
                {isActive && (
                  <span
                    className="hidden rounded-full border px-3 py-1 font-mono text-[0.6875rem] md:inline-block"
                    style={{
                      color: accent.hex,
                      borderColor: `${accent.hex}55`,
                      backgroundColor: `${accent.hex}14`,
                    }}
                  >
                    {product.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <RailButton
            direction="prev"
            disabled={active === 0}
            onClick={() => step(-1)}
            className="grid"
          />
          <RailButton
            direction="next"
            disabled={active === last}
            onClick={() => step(1)}
            className="grid"
          />
        </div>
      </div>

      {/* ── Legend / jump targets ────────────────────────────────────────── */}
      <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {products.map((product, i) => {
          const accent = accentOf(product.accent);
          const isActive = i === active;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "group flex min-h-11 items-center gap-2 rounded-ng border px-2.5 py-2 text-left",
                "transition-colors duration-300",
                isActive
                  ? "border-transparent"
                  : "border-ng-line hover:border-ng-line2 hover:bg-white/[0.03]",
              )}
              style={
                isActive
                  ? { borderColor: `${accent.hex}55`, backgroundColor: `${accent.hex}12` }
                  : undefined
              }
            >
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-ng-sm",
                  accent.chip,
                )}
              >
                <Icon name={product.icon} className="size-3.5" strokeWidth={1.75} />
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-xs font-medium transition-colors duration-300",
                  isActive ? "text-ng-fg" : "text-ng-fg2 group-hover:text-ng-fg",
                )}
              >
                {product.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ProductSlider;
