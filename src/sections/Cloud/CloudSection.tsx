import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Icon from "@/components/ui/Icon";
import TechGlyph from "@/components/ui/TechGlyph";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { cloudCapabilities, technologies } from "@/data/technologies";
import type { Technology } from "@/data/technologies";

/* Platform copy is read from the technology table rather than retyped, so the
   two sections can never drift apart. */
const platformNames = ["Microsoft Azure", "AWS", "Cloudflare"];

const platforms: Technology[] = platformNames
  .map((name) => technologies.find((tech) => tech.name === name))
  .filter((tech): tech is Technology => tech !== undefined);

const pipelineStages = ["Commit", "Build", "Test", "Container", "Deploy", "Monitor"];

function tinted(tint: string, percent: number): string {
  return `color-mix(in oklab, ${tint} ${percent}%, transparent)`;
}

/**
 * Cloud & DevOps — the platforms we deploy to, the practices around them and
 * the delivery pipeline those practices add up to.
 */
export function CloudSection() {
  return (
    <Section
      aria-labelledby="cloud-heading"
      width="default"
      spacing="md"
      divider
      backdrop={
        <>
          <GridBackdrop />
          <Aura tone="violet" size="size-[32rem]" opacity={15} className="-bottom-40 -right-24" />
        </>
      }
    >
      <SectionHeader
        align="center"
        headingId="cloud-heading"
        eyebrow="10 — Cloud & DevOps"
        title="Built To Ship,"
        highlight="Built To Scale"
        description="Containerised services, automated pipelines and monitored deployments — so releasing a change is routine rather than an event."
      />

      {/* ── Platforms ──────────────────────────────────────────────────────── */}
      <Stagger className="mt-12 grid gap-4 sm:grid-cols-3" gap={0.08}>
        {platforms.map((platform) => (
          <StaggerItem key={platform.name} as="article" className="h-full">
            <div className="ng-card group/pf relative flex h-full flex-col gap-3.5 rounded-ng-card p-5 duration-500 hover:-translate-y-1 hover:shadow-ng-lift">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/pf:opacity-100"
                style={{
                  boxShadow: `inset 0 0 0 1px ${tinted(platform.tint, 40)}`,
                  background: `radial-gradient(120% 90% at 10% 0%, ${tinted(platform.tint, 10)}, transparent 62%)`,
                }}
              />

              <span
                className="relative grid size-12 place-items-center rounded-ng-sm"
                style={{
                  backgroundColor: tinted(platform.tint, 13),
                  boxShadow: `inset 0 0 0 1px ${tinted(platform.tint, 26)}`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-ng-sm opacity-0 blur-[13px] transition-opacity duration-500 group-hover/pf:opacity-50"
                  style={{ backgroundColor: platform.tint }}
                />
                <TechGlyph
                  name={platform.glyph}
                  className="relative transition-transform duration-500 group-hover/pf:scale-[1.12]"
                  style={{ color: platform.tint, width: "1.625rem", height: "1.625rem" }}
                />
              </span>

              <h3 className="relative font-display text-base font-medium text-ng-fg">
                {platform.name}
              </h3>
              <p className="relative text-sm leading-relaxed text-ng-muted">
                {platform.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal direction="up" delay={0.1}>
        <p className="mt-4 text-center font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ng-faint">
          Platforms our teams build for and deploy to
        </p>
      </Reveal>

      {/* ── Capabilities ───────────────────────────────────────────────────── */}
      <Stagger
        as="ul"
        className="mt-12 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        gap={0.05}
      >
        {cloudCapabilities.map((capability) => (
          <StaggerItem key={capability.title} as="li" className="h-full">
            <div className="group/cap flex h-full items-start gap-3 rounded-ng border border-ng-line bg-ng-surface/50 p-4 transition-colors duration-500 hover:border-ng-line2">
              <span className="grid size-9 shrink-0 place-items-center rounded-ng-sm border border-ng-line bg-ng-surface2 text-ng-fg2 transition-colors duration-500 group-hover/cap:border-ng-cyan/40 group-hover/cap:bg-ng-cyan/10 group-hover/cap:text-ng-cyan">
                <Icon name={capability.icon} className="size-4" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-sm font-medium text-ng-fg">
                  {capability.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ng-muted">
                  {capability.body}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      {/* ── Delivery pipeline ──────────────────────────────────────────────── */}
      <Reveal direction="up" delay={0.12}>
        <div className="ng-glass mt-6 rounded-ng-card px-4 py-5 sm:px-6">
          <p className="ng-eyebrow mb-4">
            <span
              aria-hidden="true"
              className="h-px w-6 bg-gradient-to-r from-transparent to-ng-cyan"
            />
            Delivery pipeline
          </p>
          <ol className="flex flex-wrap items-center justify-center gap-y-3">
            {pipelineStages.map((stage, index) => (
              <li key={stage} className="flex items-center">
                <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ng-fg2">
                  {stage}
                </span>
                {index < pipelineStages.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="relative mx-2 h-px w-6 overflow-hidden bg-gradient-to-r from-ng-brand/45 via-ng-cyan/60 to-ng-brand/45 sm:mx-3 sm:w-12"
                  >
                    <span className="ng-shimmer-bg animate-ng-shimmer absolute inset-0" />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </Section>
  );
}

export default CloudSection;
