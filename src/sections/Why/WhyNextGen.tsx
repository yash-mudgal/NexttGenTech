import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Icon from "@/components/ui/Icon";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { company } from "@/config/company";
import { accentOf } from "@/lib/accent";
import type { Accent } from "@/data/products";
import { cn } from "@/lib/cn";

/** Accent rotation across the grid — blue, cyan, violet, repeat. */
const rotation: readonly Accent[] = ["brand", "cyan", "violet"];

/**
 * The six differentiators from the company config.
 *
 * The first card is deliberately wider and typographically louder on large
 * screens so the grid reads as an argument with a headline, not six equal tiles.
 */
export function WhyNextGen() {
  const total = company.differentiators.length;

  return (
    <Section
      width="default"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop />
          <Aura tone="brand" className="-top-32 left-1/2 -translate-x-1/2" size="size-[40rem]" opacity={16} />
        </>
      }
    >
      <SectionHeader
        align="center"
        eyebrow="13 — Why NextGen"
        title="Built Like a Product,"
        highlight="Not a Project"
        description="Six engineering principles shape every platform we ship — from the data model underneath to the screen a store manager opens on a Monday morning."
      />

      <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3" gap={0.08}>
        {company.differentiators.map((item, index) => {
          const theme = accentOf(rotation[index % rotation.length]);
          const featured = index === 0;

          return (
            <StaggerItem key={item.title} className={cn("h-full", featured && "lg:col-span-2")}>
              <article
                className={cn(
                  "ng-card group relative h-full overflow-hidden p-6 sm:p-7",
                  "transition-[transform,box-shadow,border-color] duration-500",
                  "hover:-translate-y-1 hover:border-ng-line2 hover:shadow-ng-lift",
                  "focus-within:-translate-y-1 focus-within:border-ng-line2",
                  featured && "lg:p-9",
                )}
              >
                {featured && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                    <GridBackdrop density="fine" className="opacity-60" />
                    <div className={cn("absolute -right-16 -top-16 size-52 rounded-full blur-[70px]", theme.bg)} />
                  </div>
                )}

                {/* Corner index — keeps the numbering rhythm used across the page. */}
                <span
                  aria-hidden="true"
                  className="absolute right-5 top-5 font-mono text-[0.625rem] tracking-[0.18em] text-ng-faint transition-colors duration-500 group-hover:text-ng-muted"
                >
                  {String(index + 1).padStart(2, "0")}
                  <span className="text-ng-faint/60">/{String(total).padStart(2, "0")}</span>
                </span>

                <span
                  className={cn(
                    "relative inline-flex items-center justify-center rounded-ng",
                    theme.chip,
                    featured ? "size-14 lg:size-16" : "size-12",
                  )}
                >
                  {/* Accent-matched glow, faded in on hover. The shadow itself is
                      a static class from the accent bundle so Tailwind can see it. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-0 rounded-ng opacity-0 transition-opacity duration-500",
                      "group-hover:opacity-100 group-focus-within:opacity-100",
                      theme.glow,
                    )}
                  />
                  <Icon name={item.icon} className={featured ? "size-6 lg:size-7" : "size-5"} strokeWidth={1.6} />
                </span>

                <h3
                  className={cn(
                    "mt-6 font-display font-semibold text-ng-fg",
                    featured ? "text-2xl lg:text-[1.75rem]" : "text-lg",
                  )}
                >
                  {item.title}
                </h3>

                <p
                  className={cn(
                    "mt-3 leading-relaxed text-ng-muted",
                    featured ? "max-w-xl text-[1.0625rem]" : "text-[0.9375rem]",
                  )}
                >
                  {item.body}
                </p>

                {/* Gradient hairline that fills in from the left on hover. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r",
                    "transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "group-hover:scale-x-100 group-focus-within:scale-x-100",
                    theme.gradient,
                    featured && "lg:inset-x-9",
                  )}
                />
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

export default WhyNextGen;
