import type { CSSProperties } from "react";
import Section from "@/components/layout/Section";
import TechGlyph from "@/components/ui/TechGlyph";
import { cn } from "@/lib/cn";
import { marqueeTech, technologies } from "@/data/technologies";

/* ============================================================================
 * TECH MARQUEE
 * ----------------------------------------------------------------------------
 * A full-bleed band under the hero. Two counter-scrolling rails, edge-masked,
 * paused on hover or keyboard focus.
 * ========================================================================== */

/**
 * Marquee names → glyph keys. The marquee uses short labels ("AI", "Azure")
 * while `technologies` carries the full names, so the bridge is explicit.
 * Names with no honest mark ("Cloud", "SaaS") render as type alone.
 */
const GLYPH_BY_NAME: Record<string, string> = {
  ".NET": "dotnet",
  React: "react",
  "React Native": "reactnative",
  "Node.js": "node",
  Python: "python",
  TypeScript: "typescript",
  AI: "ai",
  ML: "ml",
  "SQL Server": "sqlserver",
  PostgreSQL: "postgres",
  MongoDB: "mongodb",
  Oracle: "oracle",
  Azure: "azure",
  AWS: "aws",
  Docker: "docker",
};

/** Glyph key → the tint already defined for it in the data layer. */
const TINT_BY_GLYPH = new Map(technologies.map((tech) => [tech.glyph, tech.tint]));

interface Item {
  name: string;
  glyph?: string;
  tint?: string;
}

const ITEMS: Item[] = marqueeTech.map((name) => {
  const glyph = GLYPH_BY_NAME[name];
  return { name, glyph, tint: glyph ? TINT_BY_GLYPH.get(glyph) : undefined };
});

function MarqueeItem({ item }: { item: Item }) {
  const style = item.tint ? ({ "--ng-tint": item.tint } as CSSProperties) : undefined;

  return (
    <span className="group/item flex shrink-0 items-center" style={style}>
      <span className="flex items-center gap-2.5 px-5 sm:px-7">
        {item.glyph && (
          <TechGlyph
            name={item.glyph}
            className={cn(
              "size-5 shrink-0 text-ng-faint transition-colors duration-300",
              item.tint && "group-hover/item:text-[var(--ng-tint)]",
            )}
          />
        )}
        <span className="whitespace-nowrap font-mono text-sm uppercase tracking-widest text-ng-muted transition-colors duration-300 group-hover/item:text-ng-fg">
          {item.name}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="size-1 shrink-0 rotate-45 bg-ng-line2 transition-colors duration-300 group-hover/item:bg-ng-cyan/60"
      />
    </span>
  );
}

function Track({ reverse = false }: { reverse?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-max items-center",
        reverse
          ? "animate-ng-marquee-slow [animation-direction:reverse]"
          : "animate-ng-marquee",
        "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
      )}
    >
      {/* Exactly two copies — the -50% keyframe then loops seamlessly. */}
      {[0, 1].map((copy) => (
        <div key={copy} className="flex items-center">
          {ITEMS.map((item) => (
            <MarqueeItem key={`${copy}-${item.name}`} item={item} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function TechMarquee() {
  return (
    <Section
      width="full"
      spacing="sm"
      divider
      label="Core technology stack"
      className="after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-ng-line2 after:to-transparent"
    >
      {/* Cancel the container gutter so the band runs edge to edge. */}
      <div className="group -mx-5 overflow-hidden sm:-mx-8 lg:-mx-10">
        <div aria-hidden="true" className="ng-fade-x space-y-5">
          <Track />
          <Track reverse />
        </div>
      </div>

      {/* The rails are decorative duplicates — this is the readable copy. */}
      <ul className="sr-only">
        {marqueeTech.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </Section>
  );
}

export default TechMarquee;
