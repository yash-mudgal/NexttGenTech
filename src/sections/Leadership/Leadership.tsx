import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { foundingTeam, leadershipTeam } from "@/data/leadership";
import { cn } from "@/lib/cn";
import FounderCard from "./FounderCard";
import LeadershipCard from "./LeadershipCard";

export function Leadership() {
  const solo = foundingTeam.length === 1;
  /* An odd trailing card would otherwise sit alone in the left column. */
  const orphanTrailing = foundingTeam.length > 1 && foundingTeam.length % 2 === 1;

  return (
    <Section
      id="leadership"
      width="wide"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop />
          <Aura
            tone="violet"
            size="size-[46rem]"
            opacity={16}
            className="-top-40 left-1/2 -translate-x-1/2"
          />
        </>
      }
    >
      <SectionHeader
        eyebrow="14 — Leadership"
        title="The People"
        highlight="Behind NextGen"
        description="Engineering vision. Product thinking. Business understanding."
        align="center"
      />

      {foundingTeam.length > 0 && (
        <Stagger
          gap={0.12}
          className={cn(
            "mt-14 grid gap-8 lg:mt-20",
            solo ? "mx-auto max-w-3xl" : "lg:grid-cols-2",
            orphanTrailing &&
              "[&>*:last-child]:lg:col-span-2 [&>*:last-child]:lg:mx-auto [&>*:last-child]:lg:w-[calc(50%-1rem)]",
          )}
        >
          {foundingTeam.map((leader, index) => (
            <StaggerItem key={leader.id} className="h-full">
              <FounderCard leader={leader} index={index} />
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {leadershipTeam.length > 0 && (
        <div className="mt-16 lg:mt-24">
          <Reveal direction="up">
            <div className="flex items-center gap-4">
              <h3 className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ng-muted">
                Leadership Team
              </h3>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-r from-ng-line2 to-transparent"
              />
            </div>
          </Reveal>

          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leadershipTeam.map((leader, index) => (
              <StaggerItem key={leader.id} className="h-full">
                <LeadershipCard leader={leader} index={index} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      )}
    </Section>
  );
}

export default Leadership;
