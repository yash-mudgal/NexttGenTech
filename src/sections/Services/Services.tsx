import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Section from "@/components/layout/Section";
import Button from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { Aura, GridBackdrop } from "@/components/ui/Aura";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { sectionIds } from "@/config/links";
import type { Service, ServiceGroup } from "@/data/services";
import { serviceGroups, services } from "@/data/services";
import { cn } from "@/lib/cn";
import ServiceCard from "./ServiceCard";

/* ── Derived shape ─────────────────────────────────────────────────────────
 * The corner index on each card is its position in the *full* list, so it
 * stays stable whichever group filter is active. Computed once at module
 * scope — the data layer is static.
 * ------------------------------------------------------------------------ */

interface IndexedService {
  service: Service;
  index: number;
}

type GroupFilter = "all" | ServiceGroup;

const indexedServices: IndexedService[] = services.map((service, i) => ({
  service,
  index: i + 1,
}));

const groupedServices = serviceGroups.map((group) => ({
  ...group,
  items: indexedServices.filter((entry) => entry.service.group === group.id),
}));

const filters: { id: GroupFilter; label: string; count: number }[] = [
  { id: "all", label: "All", count: services.length },
  ...groupedServices.map((group) => ({
    id: group.id as GroupFilter,
    label: group.label,
    count: group.items.length,
  })),
];

const pad = (value: number) => String(value).padStart(2, "0");

/* ── Grid ──────────────────────────────────────────────────────────────── */

function ServiceGrid({ items, className }: { items: IndexedService[]; className?: string }) {
  return (
    <Stagger
      className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}
    >
      {items.map((entry) => (
        <StaggerItem key={entry.service.id} className="h-full">
          <ServiceCard service={entry.service} index={entry.index} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

/** One labelled block per group — only used while the "All" filter is active. */
function GroupBlock({ group }: { group: (typeof groupedServices)[number] }) {
  const headingId = `services-group-${group.id}`;

  return (
    <section aria-labelledby={headingId}>
      <div className="flex items-center gap-4">
        <h3
          id={headingId}
          className="font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-ng-fg2"
        >
          {group.label}
        </h3>
        <span
          aria-hidden="true"
          className="h-px flex-1 bg-gradient-to-r from-ng-line via-ng-line/60 to-transparent"
        />
        <span className="font-mono text-[0.6875rem] tabular-nums text-ng-faint">
          {pad(group.items.length)}
        </span>
      </div>
      <ServiceGrid items={group.items} className="mt-6" />
    </section>
  );
}

/* ── Section ───────────────────────────────────────────────────────────── */

export function Services() {
  const [active, setActive] = useState<GroupFilter>("all");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleTabKeyDown = (index: number) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = filters.length - 1;
    let next = -1;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = index === last ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = index === 0 ? last : index - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }

    if (next < 0) return;
    event.preventDefault();
    setActive(filters[next].id);
    tabRefs.current[next]?.focus();
  };

  const activeGroup = groupedServices.find((group) => group.id === active);

  return (
    <Section
      width="wide"
      spacing="lg"
      divider
      backdrop={
        <>
          <GridBackdrop />
          <Aura
            tone="brand"
            className="-top-28 right-[-12rem]"
            size="size-[38rem]"
            opacity={18}
          />
        </>
      }
    >
      <SectionHeader
        align="left"
        eyebrow="11 — Services"
        title="Engineering Capability,"
        highlight="End To End"
        description="Fourteen service lines across four disciplines — filter the grid to the group that matches what you need built."
        aside={
          <Button variant="outline" arrow="right" href={`#${sectionIds.contact}`}>
            Start a conversation
          </Button>
        }
      />

      <div className="mt-10 sm:mt-12">
        <div
          role="tablist"
          aria-label="Filter services by discipline"
          aria-orientation="horizontal"
          className="ng-glass inline-flex max-w-full flex-wrap gap-1 rounded-ng-lg p-1.5"
        >
          {filters.map((filter, index) => {
            const selected = filter.id === active;
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                id={`services-tab-${filter.id}`}
                aria-selected={selected}
                aria-controls="services-panel"
                tabIndex={selected ? 0 : -1}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                onClick={() => setActive(filter.id)}
                onKeyDown={handleTabKeyDown(index)}
                className={cn(
                  "relative inline-flex h-11 items-center gap-2 rounded-ng px-4 text-sm font-medium",
                  "transition-colors duration-300 ease-ng",
                  selected ? "text-ng-fg" : "text-ng-muted hover:text-ng-fg2",
                )}
              >
                {selected && (
                  <motion.span
                    aria-hidden="true"
                    layoutId="ng-services-tab-indicator"
                    className="absolute inset-0 rounded-ng border border-ng-line2 bg-ng-surface3"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span className="relative">{filter.label}</span>
                <span
                  className={cn(
                    "relative font-mono text-[0.625rem] tabular-nums",
                    selected ? "text-ng-cyan" : "text-ng-faint",
                  )}
                >
                  {pad(filter.count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        layout
        transition={{ duration: 0.42, ease: "easeInOut" }}
        role="tabpanel"
        id="services-panel"
        aria-labelledby={`services-tab-${active}`}
        tabIndex={0}
        className="mt-10 sm:mt-12"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="space-y-12"
          >
            {active === "all" ? (
              groupedServices.map((group) => <GroupBlock key={group.id} group={group} />)
            ) : (
              <ServiceGrid items={activeGroup?.items ?? []} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Section>
  );
}

export default Services;
