import { ArrowRight } from "lucide-react";
import Icon from "@/components/ui/Icon";
import Tag from "@/components/ui/Tag";
import type { Accent } from "@/data/products";
import type { Service, ServiceGroup } from "@/data/services";
import { accentOf } from "@/lib/accent";
import { cn } from "@/lib/cn";

/**
 * Each service group carries one accent so the grid reads as four families
 * rather than fourteen unrelated tiles. Classes come from `accentOf` — never
 * built by interpolation, or Tailwind's scanner would miss them.
 */
export const serviceGroupAccent: Record<ServiceGroup, Accent> = {
  engineering: "brand",
  intelligence: "violet",
  platform: "cyan",
  design: "amber",
};

export interface ServiceCardProps {
  service: Service;
  /** 1-based position in the full service list, rendered as the corner index. */
  index: number;
}

/**
 * A single capability tile. Deliberately non-interactive: fourteen
 * near-identical links would flood the tab order, so the section's header CTA
 * carries the action and the card only *hints* at the connection with an arrow.
 */
export function ServiceCard({ service, index }: ServiceCardProps) {
  const accent = accentOf(serviceGroupAccent[service.group]);

  return (
    <div className="group/card relative h-full">
      {/* Accent glow — sits behind the opaque card, so only the spill shows. */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-x-6 bottom-1 top-8 rounded-ng-card",
          "opacity-0 transition-opacity duration-500 ease-ng group-hover/card:opacity-100",
          accent.glow,
        )}
      />

      <article
        className={cn(
          "ng-card relative flex h-full flex-col rounded-ng-card p-6",
          "group-hover/card:-translate-y-1.5 group-hover/card:border-ng-line2",
          "group-hover/card:shadow-ng-lift",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-5 top-4 select-none font-mono text-[2.5rem]",
            "font-semibold leading-none tabular-nums text-white/[0.04]",
            "transition-colors duration-500 ease-ng group-hover/card:text-white/[0.075]",
          )}
        >
          {String(index).padStart(2, "0")}
        </span>

        <span
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-ng",
            "transition-transform duration-500 ease-ng group-hover/card:-translate-y-1",
            accent.chip,
          )}
        >
          <Icon name={service.icon} className="size-5" strokeWidth={1.6} />
        </span>

        <h3 className="mt-5 pr-10 font-display text-base font-semibold leading-snug text-ng-fg">
          {service.title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-ng-muted">{service.body}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <ul className="flex flex-wrap gap-1.5">
            {service.points.map((point) => (
              <li key={point}>
                <Tag
                  size="xs"
                  className="group-hover/card:border-ng-line2 group-hover/card:text-ng-fg"
                >
                  {point}
                </Tag>
              </li>
            ))}
          </ul>

          <ArrowRight
            aria-hidden="true"
            className={cn(
              "mb-1 size-4 shrink-0 text-ng-faint",
              "transition-[color,transform] duration-500 ease-ng",
              "group-hover/card:translate-x-1 group-hover/card:text-ng-cyan",
            )}
          />
        </div>

        {/* Accent bar growing along the bottom edge — inset to the corner radius. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-5 bottom-0 h-[2px] origin-left rounded-full",
            "scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-ng",
            "group-hover/card:scale-x-100",
            accent.gradient,
          )}
        />
      </article>
    </div>
  );
}

export default ServiceCard;
