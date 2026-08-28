import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { sectionIds } from "@/config/links";
import { industries } from "@/data/industries";
import IndustryCard from "./IndustryCard";

/**
 * The first two verticals lead the composition in a wider two-column row; the
 * remaining nine tile cleanly into three rows of three, so the grid never ends
 * on a ragged row.
 */
const leadIndustries = industries.slice(0, 2);
const restIndustries = industries.slice(2);

export function Industries() {
  return (
    <Section
      id={sectionIds.industries}
      width="wide"
      spacing="lg"
      backdrop={
        <>
          <GridBackdrop />
          <Aura
            tone="violet"
            className="-top-32 left-[-10rem]"
            size="size-[34rem]"
            opacity={18}
          />
          <Aura
            tone="cyan"
            className="bottom-[-12rem] right-[-8rem]"
            size="size-[30rem]"
            opacity={15}
          />
        </>
      }
    >
      <SectionHeader
        align="center"
        eyebrow="11 — Industries"
        title="Software Shaped By"
        highlight="The Work It Supports"
        description="Eleven verticals we build for, each mapped to the platforms that carry its everyday operational load."
      />

      <div className="mt-14 sm:mt-16">
        <Stagger className="grid gap-6 sm:grid-cols-2">
          {leadIndustries.map((industry) => (
            <StaggerItem key={industry.id} className="h-full">
              <IndustryCard industry={industry} featured />
            </StaggerItem>
          ))}
        </Stagger>

        <Stagger className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {restIndustries.map((industry) => (
            <StaggerItem key={industry.id} className="h-full">
              <IndustryCard industry={industry} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      <Reveal direction="up" className="mt-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="max-w-2xl text-ng-muted">
            Not seeing your vertical? The same modules — people, inventory, billing and
            reporting — sit underneath every platform we build.
          </p>
          <Button variant="ghost" arrow="right" href={`#${sectionIds.contact}`}>
            Tell us how your operation runs
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}

export default Industries;
