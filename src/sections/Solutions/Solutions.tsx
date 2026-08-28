/* ============================================================================
 * CORE SOLUTIONS
 * ----------------------------------------------------------------------------
 * The six platforms in @/data/products, presented once.
 *
 * This used to be two consecutive sections — "Core Solutions" (cards with
 * module lists) and "Products" (a slider of dashboard mockups) — each with its
 * own number, header, description and 3D banner, both listing the same six
 * platforms. A visitor read School ERP, Hospital ERP, CRM, HRMS, Inventory and
 * Restaurant ERP twice in a row before reaching anything new, which is what
 * made the page feel repetitive.
 *
 * They are now one section with two layers that answer different questions:
 *
 *   what each platform is    → the card grid, with module counts
 *   what it looks like       → the slider, with dashboard mockups
 *
 * One header, one banner, one number. The banner is wired to both layers: it
 * highlights whichever platform the visitor is hovering in the grid *or* has
 * centred in the slider, so the two layers read as one thing rather than two
 * takes on the same list.
 * ========================================================================== */

import { lazy, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import SceneView from "@/components/3d/SceneView";
import { sectionIds } from "@/config/links";
import { accentOf } from "@/lib/accent";
import { products } from "@/data/products";
import ProductSlider from "@/sections/Products/ProductSlider";
import { ActiveProductContext } from "@/sections/Products/ProductCard";
import SolutionCard from "./SolutionCard";
import type { SolutionCardSize } from "./SolutionCard";

/* Everything `three` stays behind this boundary so it never touches the
 * initial bundle. SceneView renders it into the site's shared WebGL canvas. */
const SolutionsScene = lazy(() => import("./SolutionsScene"));

/**
 * Editorial layout table, positional to match the order `products` is authored
 * in: two flagships first, three compact platforms, then the secondary one on
 * a full-width rail. Any product added beyond the sixth falls back to compact.
 */
const layout: { span: string; size: SolutionCardSize }[] = [
  { span: "lg:col-span-3", size: "lg" },
  { span: "lg:col-span-3", size: "lg" },
  { span: "lg:col-span-2", size: "md" },
  { span: "lg:col-span-2", size: "md" },
  { span: "md:col-span-2 lg:col-span-2", size: "md" },
  { span: "md:col-span-2 lg:col-span-6", size: "wide" },
];

const fallback: { span: string; size: SolutionCardSize } = {
  span: "lg:col-span-2",
  size: "md",
};

/* ── Fallback ────────────────────────────────────────────────────────────────
 * Shown to visitors without WebGL and to anyone who asked for reduced motion.
 * Same composition as the scene — six accent-tinted module stacks wired down to
 * one shared core — so the section says the same thing either way.
 * -------------------------------------------------------------------------- */

/** Vertical offset (px) per stack, echoing the scene's alternating depth. */
const STACK_OFFSETS = [0, 26, -10, 32, 4, 22];

function LatticeBand() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-ng-lg border border-ng-line bg-ng-surface/30">
      <div className="ng-grid-fine ng-fade-edges absolute inset-0 opacity-50" />
      <div className="ng-aura-brand absolute -bottom-24 left-1/2 size-64 -translate-x-1/2 rounded-full opacity-30 blur-[70px]" />

      <div className="absolute inset-0 flex items-start justify-center gap-2 px-4 pt-7 sm:gap-6 sm:px-10 sm:pt-9">
        {products.map((product, index) => {
          const accent = accentOf(product.accent);
          return (
            <div
              key={product.id}
              className="flex w-full max-w-[6.5rem] flex-1 flex-col items-center gap-1.5"
              style={{ transform: `translateY(${STACK_OFFSETS[index] ?? 0}px)` }}
            >
              {[0, 1, 2].map((tier) => (
                <span
                  key={tier}
                  className="h-2.5 w-full rounded-[3px] border sm:h-3.5"
                  style={{
                    borderColor: `${accent.hex}55`,
                    background: `${accent.hex}1f`,
                  }}
                />
              ))}
              <span
                className="h-10 w-px sm:h-16"
                style={{ background: `linear-gradient(180deg, ${accent.hex}66, transparent)` }}
              />
            </div>
          );
        })}
      </div>

      {/* The shared core every platform is wired back to. */}
      <div className="absolute inset-x-[10%] bottom-[18%] h-px bg-gradient-to-r from-transparent via-ng-line2 to-transparent" />
      <span className="absolute bottom-[18%] left-1/2 size-3.5 -translate-x-1/2 translate-y-1/2 rotate-45 rounded-[2px] border border-ng-brand/60 bg-ng-brand/25" />
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export function Solutions() {
  /*
   * Hover is lifted here so the scene can highlight the matching cluster. It is
   * an enhancement only: the cards are fully usable without it, and a coarse
   * pointer never sets it — a tap would otherwise leave a cluster stuck lit.
   */
  const [hovered, setHovered] = useState<string | null>(null);

  /*
   * The rail owns its active index — see ProductSlider — so the centred card
   * reports itself up through ActiveProductContext rather than the index being
   * threaded back down through the slider.
   */
  const [activeProduct, setActiveProduct] = useState(products[0]);

  const track = (id: string) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setHovered(id);
  };

  return (
    <Section
      id={sectionIds.solutions}
      label="Core solutions"
      width="wide"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop />
          <Aura
            tone="brand"
            size="size-[46rem]"
            opacity={16}
            className="-top-56 left-1/2 -translate-x-1/2"
          />
        </>
      }
    >
      <SectionHeader
        align="left"
        eyebrow="01 — Core Solutions"
        title="Technology Built Around"
        highlight="Your Business"
        description="Six complete platforms — education, healthcare and hospitality ERP alongside CRM, HRMS and inventory control. Each is engineered end to end with its own modules, portals and reporting, not a handful of features bolted onto a generic template."
        aside={
          <Button variant="outline" arrow="right" href="#contact">
            Request a walkthrough
          </Button>
        }
      />

      {/* Reserved banner. The shared canvas paints above section backgrounds,
          so the scene gets its own box with a definite height and never sits
          behind the cards.

          `hovered ?? activeProduct.id` is what ties the two layers together:
          the lattice follows the pointer while the visitor is in the grid, and
          falls back to whichever platform the slider has centred. */}
      <SceneView
        className="mt-10 h-[14rem] w-full sm:mt-12 sm:h-[17rem] lg:h-[21rem]"
        cameraPosition={[0, 0.4, 8.5]}
        cameraFov={38}
        fallback={<LatticeBand />}
      >
        <SolutionsScene hovered={hovered ?? activeProduct.id} />
      </SceneView>

      {/* ── Layer one: what each platform is ─────────────────────────────── */}
      <Stagger className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-6 lg:gap-6">
        {products.map((product, index) => {
          const { span, size } = layout[index] ?? fallback;
          return (
            <StaggerItem key={product.id} className={span}>
              {/* Wrapper rather than card props: SolutionCard's own hover is
                  pure CSS, and this only mirrors it into the scene. */}
              <div
                className="h-full"
                onPointerEnter={track(product.id)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(product.id)}
                onBlur={() => setHovered(null)}
              >
                <SolutionCard product={product} index={index + 1} size={size} />
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      {/* ── Layer two: what each platform looks like ─────────────────────────
          Keeps the `#products` anchor alive now that the standalone Products
          section is gone — the navbar link still lands on the dashboards,
          which is what it always pointed at. `scroll-mt` clears the fixed
          header the same way `scroll-padding-top` does for the top-level
          sections. */}
      <div id={sectionIds.products} className="mt-20 scroll-mt-26 sm:mt-24">
        <Reveal direction="up">
          <h3 className="font-display text-[clamp(1.375rem,1rem+1.4vw,1.875rem)] font-semibold leading-tight text-ng-fg">
            Inside the <span className="ng-gradient-text">platforms</span>
          </h3>
          <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-ng-muted">
            The same six systems, from the operator&rsquo;s side of the screen.
          </p>
        </Reveal>

        <ActiveProductContext.Provider value={setActiveProduct}>
          <ProductSlider className="mt-8 sm:mt-10" />
        </ActiveProductContext.Provider>

        <Reveal direction="up" delay={0.1}>
          <p className="mt-8 font-mono text-[0.6875rem] leading-relaxed text-ng-faint">
            Interfaces shown are illustrative product mockups — figures are sample data, not client
            results.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}

export default Solutions;
