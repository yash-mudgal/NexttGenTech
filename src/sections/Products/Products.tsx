/* ============================================================================
 * PRODUCTS
 * ----------------------------------------------------------------------------
 * The showcase for the six platforms in @/data/products — each one presented
 * with its own hand-built dashboard mockup inside a snap-scrolling rail, under
 * a 3D banner that frames the whole set as one family of systems.
 * ========================================================================== */

import { lazy, useState } from "react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal } from "@/components/ui/Reveal";
import SceneView from "@/components/3d/SceneView";
import { cn } from "@/lib/cn";
import { accentOf } from "@/lib/accent";
import { products } from "@/data/products";
import ProductSlider from "./ProductSlider";
import { ActiveProductContext } from "./ProductCard";

/* Everything `three` stays behind this boundary so it never touches the
 * initial bundle. SceneView renders it into the site's shared WebGL canvas. */
const ProductScene = lazy(() => import("./ProductScene"));

/* ── Fallback ────────────────────────────────────────────────────────────────
 * Shown to visitors without WebGL and to anyone who asked for reduced motion.
 * The banner is a reserved band in the layout, so this has to be a finished
 * composition — an empty strip above the slider would read as a broken image.
 * -------------------------------------------------------------------------- */

/** Bar heights per plate, fixed so the composition never re-shuffles. */
const PLATES = [
  { heights: [46, 68, 54, 82, 62, 90], size: "h-[58%] w-[30%]", rotate: -2.5, offset: "self-end" },
  { heights: [58, 40, 74, 52, 88], size: "h-[76%] w-[34%]", rotate: 1.5, offset: "self-center" },
  { heights: [70, 50, 84, 60], size: "h-[50%] w-[26%]", rotate: 3, offset: "self-start" },
] as const;

function DashboardBand({ hex }: { hex: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-ng-lg border border-ng-line bg-ng-surface/30">
      <div className="ng-grid-fine ng-fade-edges absolute inset-0 opacity-50" />
      <div
        className="absolute inset-x-[20%] -bottom-20 h-44 rounded-full opacity-40 blur-[70px]"
        style={{ background: `radial-gradient(ellipse at center, ${hex}, transparent 70%)` }}
      />

      <div className="absolute inset-0 flex items-stretch justify-center gap-3 p-5 sm:gap-6 sm:p-7">
        {PLATES.map((plate, index) => (
          <div
            key={index}
            className={cn(
              "ng-glass flex max-w-[18rem] flex-col gap-2 rounded-ng border p-2.5 sm:gap-2.5 sm:p-3.5",
              plate.size,
              plate.offset,
            )}
            style={{ borderColor: `${hex}33`, transform: `rotate(${plate.rotate}deg)` }}
          >
            <span className="h-1 w-1/2 shrink-0 rounded-full bg-ng-line2" />
            <div className="flex shrink-0 gap-1.5">
              {[0, 1, 2].map((tile) => (
                <span key={tile} className="h-4 flex-1 rounded-ng-sm bg-white/[0.05] sm:h-5" />
              ))}
            </div>
            <div className="mt-auto flex h-[46%] items-end gap-1 sm:gap-1.5">
              {plate.heights.map((height, bar) => (
                <span
                  key={bar}
                  className="flex-1 rounded-t-[3px]"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(180deg, ${hex}, ${hex}1f)`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */

export function Products() {
  /*
   * The rail owns the active index — see ProductSlider — so the centred card
   * reports itself up through ActiveProductContext rather than the index being
   * threaded back down through the slider. The banner re-tints from here.
   */
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const accent = accentOf(activeProduct.accent);

  return (
    <Section
      id="products"
      width="wide"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop density="coarse" />
          <Aura tone="brand" className="-top-32 left-[10%]" size="size-[36rem]" opacity={16} />
        </>
      }
    >
      <SectionHeader
        align="left"
        eyebrow="03 — Products"
        title="Platforms Ready To"
        highlight="Run Your Operation"
        description="Six platforms, each with its own module set, portals and dashboards — education, healthcare and hospitality ERP alongside CRM, HRMS and inventory control."
        aside={
          <Button variant="outline" arrow="right" href="#contact">
            Request a walkthrough
          </Button>
        }
      />

      {/* Reserved banner. The shared canvas paints above section backgrounds,
          so the scene gets its own box with a definite height and never sits
          behind the copy. */}
      <SceneView
        className="mt-10 h-[15rem] w-full sm:mt-12 sm:h-[18rem] lg:h-[22rem]"
        cameraPosition={[0, 0.7, 7.4]}
        cameraFov={38}
        fallback={<DashboardBand hex={accent.hex} />}
      >
        <ProductScene accent={activeProduct.accent} />
      </SceneView>

      <ActiveProductContext.Provider value={setActiveProduct}>
        <ProductSlider className="mt-10 sm:mt-12" />
      </ActiveProductContext.Provider>

      <Reveal direction="up" delay={0.1}>
        <p className="mt-8 font-mono text-[0.6875rem] leading-relaxed text-ng-faint">
          Interfaces shown are illustrative product mockups — figures are sample data, not client
          results.
        </p>
      </Reveal>
    </Section>
  );
}

export default Products;
