import { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSectionLabel } from "@/components/layout/sectionLabel";
import { Reveal } from "./Reveal";

export interface SectionHeaderProps {
  /** Small monospace label, e.g. "02 — Products". */
  eyebrow?: string;
  title: ReactNode;
  /** Part of the title rendered in the brand gradient. Appended after `title`. */
  highlight?: string;
  description?: ReactNode;
  align?: "left" | "center";
  /** Extra content on the right of a left-aligned header (e.g. a CTA). */
  aside?: ReactNode;
  className?: string;
  /** Heading level for correct document outline. */
  as?: "h2" | "h3";
  /**
   * Lands on the heading element so the surrounding `<Section>` can be named
   * with `aria-labelledby` rather than duplicating its title in `label`.
   */
  headingId?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  highlight,
  description,
  align = "center",
  aside,
  className,
  as: Heading = "h2",
  headingId,
}: SectionHeaderProps) {
  const centered = align === "center";

  // Name the enclosing Section landmark with this heading, unless the caller
  // supplied its own id (in which case it is wiring the relationship itself).
  const sectionLabel = useSectionLabel();
  const claimSection = !headingId && sectionLabel !== null;
  const resolvedHeadingId = headingId ?? (claimSection ? sectionLabel.headingId : undefined);
  const register = sectionLabel?.register;

  useEffect(() => {
    if (claimSection) register?.();
  }, [claimSection, register]);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6",
        centered ? "items-center text-center" : "items-start",
        !centered && aside && "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("flex flex-col", centered ? "items-center" : "items-start")}>
        {eyebrow && (
          <Reveal direction="up" duration={0.5}>
            <span className="ng-eyebrow mb-4">
              <span
                aria-hidden="true"
                className="h-px w-6 bg-gradient-to-r from-transparent to-ng-cyan"
              />
              {eyebrow}
            </span>
          </Reveal>
        )}

        <Reveal direction="up" delay={0.06}>
          <Heading
            id={resolvedHeadingId}
            className={cn(
              "text-balance font-display font-semibold text-ng-fg",
              "text-[clamp(1.75rem,1.1rem+2.6vw,3.25rem)] leading-[1.08]",
              centered && "max-w-3xl",
            )}
          >
            {title}
            {highlight && (
              <>
                {" "}
                <span className="ng-gradient-text">{highlight}</span>
              </>
            )}
          </Heading>
        </Reveal>

        {description && (
          <Reveal direction="up" delay={0.12}>
            <p
              className={cn(
                "mt-5 text-pretty text-[1.0625rem] leading-relaxed text-ng-muted",
                centered ? "mx-auto max-w-2xl" : "max-w-2xl",
              )}
            >
              {description}
            </p>
          </Reveal>
        )}
      </div>

      {aside && !centered && (
        <Reveal direction="up" delay={0.16} className="shrink-0">
          {aside}
        </Reveal>
      )}
    </div>
  );
}

export default SectionHeader;
