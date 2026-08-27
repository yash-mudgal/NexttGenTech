import type { Ref } from "react";
import { motion } from "framer-motion";

import TechGlyph from "@/components/ui/TechGlyph";
import { techCategories } from "@/data/technologies";
import type { TechCategoryId, Technology } from "@/data/technologies";

/** Human label for the card's category chip. */
function labelOf(category: TechCategoryId): string {
  return techCategories.find((c) => c.id === category)?.label ?? category;
}

/** `color-mix` against the technology's own tint — keeps every wash on-brand. */
function tinted(tint: string, percent: number): string {
  return `color-mix(in oklab, ${tint} ${percent}%, transparent)`;
}

export interface TechnologyCardProps {
  tech: Technology;
  /** Forwarded so AnimatePresence's `popLayout` can measure an exiting tile. */
  ref?: Ref<HTMLElement>;
}

/**
 * One tile on the technology wall.
 *
 * The description is always rendered rather than hidden behind hover — touch
 * visitors get the same information as pointer visitors, and there is no
 * disclosure state to announce. Hover adds a tinted wash, a glow behind the
 * glyph and a tinted hairline, but never reveals content that was not there.
 *
 * The outer `motion.article` owns layout + presence (framer drives its
 * transform); the inner `.ng-card` owns the CSS hover transform, so the two
 * never fight over the same property.
 */
export function TechnologyCard({ tech, ref }: TechnologyCardProps) {
  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="h-full"
    >
      <div className="ng-card group/tech relative flex h-full flex-col gap-3 rounded-ng p-3.5 duration-500 hover:-translate-y-1 hover:shadow-ng-lift sm:p-4">
        {/* Tint wash + tinted hairline, faded in on hover. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/tech:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 1px ${tinted(tech.tint, 42)}`,
            background: `radial-gradient(130% 100% at 12% 0%, ${tinted(tech.tint, 11)}, transparent 62%)`,
          }}
        />

        <div
          className="relative grid size-11 shrink-0 place-items-center rounded-ng-sm"
          style={{
            backgroundColor: tinted(tech.tint, 14),
            boxShadow: `inset 0 0 0 1px ${tinted(tech.tint, 28)}`,
          }}
        >
          {/* Soft glow in the technology's own tint. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-ng-sm opacity-0 blur-[13px] transition-opacity duration-500 group-hover/tech:opacity-55"
            style={{ backgroundColor: tech.tint }}
          />
          <TechGlyph
            name={tech.glyph}
            className="relative transition-transform duration-500 group-hover/tech:scale-[1.12]"
            style={{ color: tech.tint, width: "1.75rem", height: "1.75rem" }}
          />
        </div>

        <div className="relative flex flex-col gap-1">
          <h3 className="font-display text-sm font-medium leading-snug text-ng-fg">
            {tech.name}
          </h3>
          <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-ng-faint transition-colors duration-500 group-hover/tech:text-ng-cyan">
            {labelOf(tech.category)}
          </span>
        </div>

        <p className="relative mt-auto pt-1 text-xs leading-relaxed text-ng-muted transition-colors duration-500 group-hover/tech:text-ng-fg2">
          {tech.description}
        </p>
      </div>
    </motion.article>
  );
}

export default TechnologyCard;
