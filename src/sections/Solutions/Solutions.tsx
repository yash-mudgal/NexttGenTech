import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { sectionIds } from "@/config/links";
import { products } from "@/data/products";
import SolutionCard from "./SolutionCard";
import type { SolutionCardSize } from "./SolutionCard";

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

/**
 * Core Solutions — the six platforms, laid out as an asymmetric grid rather
 * than six identical tiles so the flagships read as flagships.
 */
export function Solutions() {
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
        description="Each of these is a complete platform engineered end to end — its own modules, portals and reporting — not a handful of features bolted onto a generic template."
      />

      <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-16 lg:grid-cols-6 lg:gap-6">
        {products.map((product, index) => {
          const { span, size } = layout[index] ?? fallback;
          return (
            <StaggerItem key={product.id} className={span}>
              <SolutionCard product={product} index={index + 1} size={size} />
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

export default Solutions;
