/* ============================================================================
 * PRODUCTS
 * ----------------------------------------------------------------------------
 * The showcase for the six platforms in @/data/products — each one presented
 * with its own hand-built dashboard mockup inside a snap-scrolling rail.
 * ========================================================================== */

import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal } from "@/components/ui/Reveal";
import ProductSlider from "./ProductSlider";

export function Products() {
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

      <ProductSlider className="mt-12 sm:mt-14" />

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
