import { Cloud, Code2, Mail, Package, Phone, Repeat, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Section from "@/components/layout/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { company } from "@/config/company";
import { products } from "@/data/products";
import { industries } from "@/data/industries";
import { techCategories, technologies } from "@/data/technologies";

/* ── Derived once from the data layer, so the panel can never go stale ────── */

/** One representative technology per category — frontend through cloud. */
const stackHighlights = techCategories
  .map((category) => technologies.find((tech) => tech.category === category.id)?.name)
  .filter((name): name is string => name !== undefined);

const INDUSTRY_PREVIEW = 4;
const previewedIndustries = industries.slice(0, INDUSTRY_PREVIEW).map((i) => i.name).join(" · ");
const remainingIndustries = Math.max(0, industries.length - INDUSTRY_PREVIEW);

interface GlanceRow {
  term: string;
  /** Rendered as a mono numeral ahead of the value. */
  count?: number;
  value: string;
}

const glance: GlanceRow[] = [
  { term: "Focus", value: "ERP · CRM · HRMS · AI · SaaS · Cloud" },
  {
    term: "Platforms",
    count: products.length,
    value: products.map((product) => product.name).join(" · "),
  },
  {
    term: "Industries",
    count: industries.length,
    value:
      remainingIndustries > 0
        ? `${previewedIndustries} + ${remainingIndustries} more`
        : previewedIndustries,
  },
  { term: "Stack", value: stackHighlights.join(" · ") },
  { term: "Model", value: "Product-based · Subscription-based" },
  { term: "Engagement", value: "Custom builds · Platform licensing · Long-term support" },
];

const badgeIcons: Partial<Record<string, LucideIcon>> = {
  "Software Solutions": Code2,
  SaaS: Cloud,
  "Product Based": Package,
  "Subscription Based": Repeat,
};

export function About() {
  return (
    <Section id="about" width="wide" spacing="lg">
      <SectionHeader
        eyebrow="15 — About"
        title="A Software Company"
        highlight="Built Around Products"
        align="left"
      />

      <div className="mt-14 grid gap-14 lg:mt-16 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ── Prose ────────────────────────────────────────────────────── */}
        <div className="min-w-0">
          <Reveal direction="up">
            <p className="text-lg leading-relaxed text-ng-fg2">{company.about}</p>
          </Reveal>

          <Reveal direction="up" delay={0.08}>
            <div className="mt-6 space-y-5 text-[0.9375rem] leading-relaxed text-ng-muted">
              <p>
                A build starts with how the organisation actually runs today — who approves what,
                which numbers people already trust, and where the workarounds have quietly become
                the process. We model the data before we design the screens, because the data model
                is the part that is expensive to change once a system is live. From there the work
                ships in reviewable increments, so the people who will use the software see it
                working long before it is finished.
              </p>
              <p>
                Product-based and subscription-based describes a commitment rather than a price
                list. Our platforms are maintained products with a release cycle: they keep getting
                security patches, new modules and performance work after go-live. A customer is
                licensing something that continues to be engineered — not receiving a one-off
                delivery that starts ageing the day it is handed over.
              </p>
              <p>
                Behind that sits a stack deliberately broad enough to cover a whole system end to
                end — the web and mobile surfaces, the transactional core, the data layer, the
                intelligence layered on top and the cloud it all runs on. Each piece is chosen for
                the problem in front of us rather than out of habit.
              </p>
            </div>
          </Reveal>

          <Stagger as="ul" className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {company.badges.map((badge) => {
              const BadgeIcon = badgeIcons[badge] ?? Sparkles;
              return (
                <StaggerItem key={badge} as="li" className="h-full">
                  <div className="ng-glass flex h-full items-center gap-2.5 rounded-ng px-3.5 py-3">
                    <BadgeIcon aria-hidden="true" className="size-4 shrink-0 text-ng-cyan" />
                    <span className="text-xs font-medium leading-snug text-ng-fg2">{badge}</span>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>

        {/* ── At a glance ──────────────────────────────────────────────── */}
        <Reveal direction="up" delay={0.12} className="h-fit min-w-0 lg:sticky lg:top-28">
          <div className="ng-glass rounded-ng-lg p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-ng-cyan" />
              <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ng-muted">
                Company at a glance
              </h3>
            </div>

            <dl className="mt-5">
              {glance.map((row) => (
                <div
                  key={row.term}
                  className="grid gap-1 border-t border-ng-line py-4 first:border-t-0 first:pt-0 sm:grid-cols-[6.5rem_1fr] sm:gap-4"
                >
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ng-faint">
                    {row.term}
                  </dt>
                  <dd className="min-w-0 text-sm leading-relaxed text-ng-fg2">
                    {row.count !== undefined && (
                      <span className="mr-2 font-mono font-semibold text-ng-cyan">{row.count}</span>
                    )}
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="ng-glass mt-5 flex flex-col gap-4 rounded-ng-lg p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2.5">
              <a
                href={`mailto:${company.contact.email}`}
                className="inline-flex items-start gap-2.5 text-sm text-ng-fg2 transition-colors duration-300 hover:text-ng-cyan"
              >
                <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ng-cyan" />
                <span className="break-words">{company.contact.email}</span>
              </a>
              <a
                href={`tel:${company.contact.phoneHref}`}
                className="inline-flex items-start gap-2.5 text-sm text-ng-fg2 transition-colors duration-300 hover:text-ng-cyan"
              >
                <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-ng-cyan" />
                <span className="break-words">{company.contact.phone}</span>
              </a>
            </div>

            <Button
              variant="ghost"
              size="sm"
              href="#contact"
              arrow="right"
              className="shrink-0 self-start sm:self-auto"
            >
              Talk to us
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

export default About;
