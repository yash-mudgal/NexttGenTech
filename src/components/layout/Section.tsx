import { useCallback, useId, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionLabelContext } from "./sectionLabel";

export interface SectionProps {
  /** Anchor target — must match an entry in `sectionIds` when nav links to it. */
  id?: string;
  children: ReactNode;
  className?: string;
  /** Inner container width. "wide" = 84rem, "default" = 76rem, "narrow" = 60rem. */
  width?: "narrow" | "default" | "wide" | "full";
  /** Vertical rhythm. */
  spacing?: "sm" | "md" | "lg";
  /** Decorative layer rendered behind the content, clipped to the section. */
  backdrop?: ReactNode;
  /** Hairline divider along the top edge. */
  divider?: boolean;
  /** Accessible name for the landmark, when there's no visible heading. */
  label?: string;
  "aria-labelledby"?: string;
}

const widths = {
  narrow: "max-w-[60rem]",
  default: "max-w-[76rem]",
  wide: "max-w-[86rem]",
  full: "max-w-none",
} as const;

const spacings = {
  sm: "py-14 sm:py-16",
  md: "py-20 sm:py-24 lg:py-28",
  lg: "py-24 sm:py-32 lg:py-40",
} as const;

/**
 * Standard page section: landmark element, clipped decorative layer and the
 * shared container width. Use this rather than hand-rolling <section> wrappers
 * so vertical rhythm stays consistent down the whole page.
 */
export function Section({
  id,
  children,
  className,
  width = "default",
  spacing = "md",
  backdrop,
  divider = false,
  label,
  "aria-labelledby": labelledBy,
}: SectionProps) {
  // A section is only exposed as a landmark once it has an accessible name.
  // Rather than make every call site invent an id, the header inside claims
  // this one — see ./sectionLabel.
  const generatedId = `${useId()}-heading`;
  const [headerClaimed, setHeaderClaimed] = useState(false);
  const register = useCallback(() => setHeaderClaimed(true), []);
  const labelContext = useMemo(
    () => ({ headingId: generatedId, register }),
    [generatedId, register],
  );

  const named = labelledBy ?? (!label && headerClaimed ? generatedId : undefined);

  return (
    <section
      id={id}
      aria-label={label}
      aria-labelledby={named}
      className={cn(
        "relative isolate w-full overflow-x-clip",
        spacings[spacing],
        divider &&
          "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-ng-line2 before:to-transparent",
        className,
      )}
    >
      {backdrop && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {backdrop}
        </div>
      )}
      <div className={cn("mx-auto w-full px-5 sm:px-8 lg:px-10", widths[width])}>
        <SectionLabelContext.Provider value={labelContext}>{children}</SectionLabelContext.Provider>
      </div>
    </section>
  );
}

export default Section;
