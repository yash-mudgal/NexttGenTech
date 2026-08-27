import { useState } from "react";

import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Tag from "@/components/ui/Tag";
import TechGlyph from "@/components/ui/TechGlyph";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { databases } from "@/data/technologies";
import { cn } from "@/lib/cn";

import DataArchitecture from "./DataArchitecture";

function tinted(tint: string, percent: number): string {
  return `color-mix(in oklab, ${tint} ${percent}%, transparent)`;
}

/**
 * Data layer — the architecture diagram plus the engine detail cards.
 *
 * The hovered-engine state lives here so a card can light up its matching
 * storage node in the diagram above it, and vice versa.
 */
export function DatabaseSection() {
  const [activeDatabase, setActiveDatabase] = useState<string | null>(null);

  return (
    <Section
      aria-labelledby="data-heading"
      width="wide"
      spacing="lg"
      backdrop={
        <>
          <GridBackdrop />
          <Aura tone="cyan" size="size-[34rem]" opacity={16} className="top-24 -left-48" />
          <Aura
            tone="violet"
            size="size-[30rem]"
            opacity={14}
            className="-bottom-32 -right-32"
          />
        </>
      }
    >
      <SectionHeader
        align="left"
        headingId="data-heading"
        eyebrow="09 — Data"
        title="Data That"
        highlight="Powers Your Business"
        description="We model the data around how the business actually operates — its entities, its rules and its reporting — before a single screen gets built."
      />

      <Reveal direction="up" delay={0.1} className="mt-12 lg:mt-16">
        <DataArchitecture
          activeDatabase={activeDatabase}
          onDatabaseHover={setActiveDatabase}
        />
      </Reveal>

      <Stagger
        as="ul"
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        gap={0.08}
      >
        {databases.map((db) => {
          const isActive = db.name === activeDatabase;
          return (
            <StaggerItem key={db.name} as="li" className="h-full">
              <article
                onMouseEnter={() => setActiveDatabase(db.name)}
                onMouseLeave={() => setActiveDatabase(null)}
                className={cn(
                  "ng-card group/db relative flex h-full flex-col gap-4 rounded-ng-card p-5 duration-500",
                  "hover:-translate-y-1 hover:shadow-ng-lift",
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/db:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${tinted(db.tint, 40)}`,
                    background: `radial-gradient(120% 90% at 8% 0%, ${tinted(db.tint, 10)}, transparent 60%)`,
                  }}
                />

                <div className="relative flex items-center gap-3">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-ng-sm transition-transform duration-500 group-hover/db:scale-[1.08]"
                    style={{
                      backgroundColor: tinted(db.tint, isActive ? 20 : 13),
                      boxShadow: `inset 0 0 0 1px ${tinted(db.tint, 28)}`,
                    }}
                  >
                    <TechGlyph
                      name={db.glyph}
                      style={{ color: db.tint, width: "1.625rem", height: "1.625rem" }}
                    />
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="truncate font-display text-base font-medium text-ng-fg">
                      {db.name}
                    </h3>
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-ng-faint">
                      {db.kind}
                    </span>
                  </div>
                </div>

                <p className="relative text-sm leading-relaxed text-ng-muted">{db.role}</p>

                <ul className="relative mt-auto flex flex-wrap gap-1.5 pt-1">
                  {db.strengths.map((strength) => (
                    <li key={strength}>
                      <Tag size="xs" dot={db.tint}>
                        {strength}
                      </Tag>
                    </li>
                  ))}
                </ul>
              </article>
            </StaggerItem>
          );
        })}
      </Stagger>
    </Section>
  );
}

export default DatabaseSection;
