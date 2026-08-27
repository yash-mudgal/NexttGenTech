import type { ReactNode, SVGProps } from "react";
import { cn } from "@/lib/cn";

/* ============================================================================
 * TECH GLYPHS
 * ----------------------------------------------------------------------------
 * Original, simplified marks drawn on a 24×24 grid. We deliberately do NOT
 * redistribute third-party brand logos — each glyph is our own geometric
 * interpretation, so there is no licensing question and the whole set shares
 * one visual language.
 *
 * Every glyph inherits `currentColor`, so tinting is done by the consumer.
 * ========================================================================== */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Monospace letterform mark — used where a pictogram would be ambiguous. */
function Letters({ children, dy = 0 }: { children: ReactNode; dy?: number }) {
  return (
    <text
      x="12"
      y={15.5 + dy}
      textAnchor="middle"
      fontSize="9.5"
      fontWeight="700"
      letterSpacing="-0.3"
      fill="currentColor"
      fontFamily="var(--font-mono)"
    >
      {children}
    </text>
  );
}

const glyphs: Record<string, ReactNode> = {
  /* ── Frontend ─────────────────────────────────────────────────────────── */
  react: (
    <>
      <circle cx="12" cy="12" r="2.05" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9.4" ry="3.6" {...S} />
      <ellipse cx="12" cy="12" rx="9.4" ry="3.6" {...S} transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.4" ry="3.6" {...S} transform="rotate(120 12 12)" />
    </>
  ),
  reactnative: (
    <>
      <rect x="7.4" y="2.6" width="9.2" height="18.8" rx="2.2" {...S} />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="4.1" ry="1.8" {...S} transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="4.1" ry="1.8" {...S} transform="rotate(-30 12 12)" />
    </>
  ),
  typescript: (
    <>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="4" {...S} />
      <Letters>TS</Letters>
    </>
  ),
  javascript: (
    <>
      <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="4" {...S} />
      <Letters>JS</Letters>
    </>
  ),
  tailwind: (
    <>
      <path d="M2.8 11c1.4-3.7 3.6-5.6 6.6-5.6 4.5 0 5 3.4 7.3 4 1.6.4 3-.2 4.2-1.8-1.4 3.7-3.6 5.6-6.6 5.6-4.5 0-5-3.4-7.3-4-1.6-.4-3 .2-4.2 1.8Z" {...S} />
      <path d="M2.8 18.4c1.4-3.7 3.6-5.6 6.6-5.6" {...S} opacity="0.55" />
      <path d="M9.4 12.8c4.5 0 5 3.4 7.3 4 1.6.4 3-.2 4.2-1.8" {...S} opacity="0.55" />
    </>
  ),
  html: (
    <>
      <path d="M9.6 7.2 5.2 12l4.4 4.8" {...S} />
      <path d="M14.4 7.2 18.8 12l-4.4 4.8" {...S} />
      <path d="M12.9 5.6 11.1 18.4" {...S} opacity="0.6" />
    </>
  ),
  css: (
    <>
      <path d="M10 4.4c-2.6 0-3.6 1.3-3.6 3.4v1.9c0 1.4-.7 2.2-2.1 2.3 1.4.1 2.1.9 2.1 2.3v1.9c0 2.1 1 3.4 3.6 3.4" {...S} />
      <path d="M14 4.4c2.6 0 3.6 1.3 3.6 3.4v1.9c0 1.4.7 2.2 2.1 2.3-1.4.1-2.1.9-2.1 2.3v1.9c0 2.1-1 3.4-3.6 3.4" {...S} />
    </>
  ),

  /* ── Backend ──────────────────────────────────────────────────────────── */
  dotnet: (
    <>
      <circle cx="4.6" cy="17.6" r="1.9" fill="currentColor" stroke="none" />
      <path d="M9.4 18.4V8.2l6.6 10.2V8.2" {...S} />
      <path d="M18.6 8.2h2.8M20 8.2v10.2" {...S} opacity="0.7" />
    </>
  ),
  aspnet: (
    <>
      <circle cx="4.4" cy="17.8" r="1.7" fill="currentColor" stroke="none" />
      <path d="M8.6 18.6 12 6.4l3.4 12.2" {...S} />
      <path d="M9.9 14.4h4.2" {...S} />
      <path d="M18 9.4h3.4M19.7 9.4v9.2" {...S} opacity="0.7" />
    </>
  ),
  node: (
    <>
      <path d="M12 2.9 20.4 7.6v8.8L12 21.1 3.6 16.4V7.6Z" {...S} />
      <path d="M9.4 15.3c.5.9 1.4 1.4 2.6 1.4 1.6 0 2.6-.8 2.6-2 0-1.3-.9-1.8-2.6-2.1-1.7-.3-2.6-.8-2.6-2.1 0-1.2 1-2 2.5-2 1.1 0 1.9.4 2.4 1.2" {...S} />
    </>
  ),
  python: (
    <>
      <path d="M12 3.2c-3 0-4.6.9-4.6 3v2.6h4.8v.9H5.6c-1.9 0-3 1.5-3 4s1.1 4 3 4h1.4v-2.9c0-2.1 1.5-3.5 3.7-3.5h3.4" {...S} />
      <path d="M12 20.8c3 0 4.6-.9 4.6-3v-2.6h-4.8v-.9h6.6c1.9 0 3-1.5 3-4s-1.1-4-3-4H17v2.9c0 2.1-1.5 3.5-3.7 3.5H9.9" {...S} />
    </>
  ),

  /* ── AI / ML ──────────────────────────────────────────────────────────── */
  ai: (
    <>
      <path d="M12 2.6 13.7 8l5.4 1.7-5.4 1.7L12 16.8l-1.7-5.4L4.9 9.7 10.3 8Z" {...S} />
      <path d="M18.4 15.6l.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8Z" {...S} opacity="0.65" />
    </>
  ),
  ml: (
    <>
      <circle cx="5" cy="6.4" r="2" {...S} />
      <circle cx="5" cy="17.6" r="2" {...S} />
      <circle cx="12" cy="12" r="2.2" {...S} />
      <circle cx="19" cy="7.4" r="2" {...S} />
      <circle cx="19" cy="16.6" r="2" {...S} />
      <path d="M6.8 7.5 10 10.8M6.8 16.5 10 13.2M14.1 11 17 8.3M14.1 13 17 15.7" {...S} opacity="0.7" />
    </>
  ),
  genai: (
    <>
      <path d="M9.4 2.8 11 7.2l4.4 1.6-4.4 1.6L9.4 14.8 7.8 10.4 3.4 8.8 7.8 7.2Z" {...S} />
      <path d="M17.2 12.6l1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1Z" {...S} opacity="0.7" />
    </>
  ),
  llm: (
    <>
      <path d="M20.4 15.4a2 2 0 0 1-2 2H9.2l-4.2 3.2v-3.2a2 2 0 0 1-1.4-2V6.2a2 2 0 0 1 2-2h12.8a2 2 0 0 1 2 2Z" {...S} />
      <path d="M8.4 10.6h7.2M8.4 13.4h4.6" {...S} opacity="0.75" />
    </>
  ),
  aiapi: (
    <>
      <path d="M8 5.4c-2.2 0-3.2 1.1-3.2 2.9v1.6c0 1.2-.6 1.9-1.8 2 1.2.1 1.8.8 1.8 2v1.6c0 1.8 1 2.9 3.2 2.9" {...S} />
      <path d="M16 5.4c2.2 0 3.2 1.1 3.2 2.9v1.6c0 1.2.6 1.9 1.8 2-1.2.1-1.8.8-1.8 2v1.6c0 1.8-1 2.9-3.2 2.9" {...S} />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),

  /* ── Databases ────────────────────────────────────────────────────────── */
  sqlserver: (
    <>
      <ellipse cx="12" cy="5.8" rx="7.6" ry="3" {...S} />
      <path d="M4.4 5.8v12.4c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3V5.8" {...S} />
      <path d="M4.4 12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3" {...S} opacity="0.55" />
    </>
  ),
  postgres: (
    <>
      <ellipse cx="12" cy="6" rx="7.4" ry="2.9" {...S} />
      <path d="M4.6 6v11.4c0 1.6 3.3 2.9 7.4 2.9s7.4-1.3 7.4-2.9V6" {...S} />
      <circle cx="12" cy="13" r="2.4" {...S} opacity="0.75" />
    </>
  ),
  mongodb: (
    <>
      <path d="M12 2.6c3.4 3.6 5.2 6.7 5.2 9.6 0 3.4-2.3 6.1-5.2 7.4-2.9-1.3-5.2-4-5.2-7.4 0-2.9 1.8-6 5.2-9.6Z" {...S} />
      <path d="M12 6.4v14.9" {...S} opacity="0.65" />
    </>
  ),
  oracle: (
    <>
      <rect x="2.6" y="6.6" width="18.8" height="10.8" rx="5.4" {...S} />
      <rect x="7" y="9.8" width="10" height="4.4" rx="2.2" {...S} opacity="0.6" />
    </>
  ),

  /* ── Cloud & infrastructure ───────────────────────────────────────────── */
  azure: (
    <>
      <path d="M9.4 3.4h5.2l6.4 17.2H14L9.4 3.4Z" {...S} />
      <path d="M8 8.4 2.8 18.6l6.6 2 5.3-2.4" {...S} opacity="0.7" />
    </>
  ),
  aws: (
    <>
      <path d="M4 9.8c0-1.1.9-2 2-2h.4a4.4 4.4 0 0 1 8.5-1.2 3.5 3.5 0 0 1 4.9 3.2 3.4 3.4 0 0 1-1 2.4" {...S} />
      <path d="M3.2 17.4c3 1.7 6.2 2.5 8.8 2.5s5.8-.8 8.8-2.5" {...S} />
      <path d="M19.6 15.4c1.4-.4 2.2-.2 2.2.5 0 .6-.5 1.4-1.3 2.2" {...S} opacity="0.7" />
    </>
  ),
  cloudflare: (
    <>
      <path d="M6.2 17.4h11a3.2 3.2 0 0 0 .3-6.3 5.4 5.4 0 0 0-9.9-2.2A3.7 3.7 0 0 0 6.2 17.4Z" {...S} />
      <path d="M2.6 14.6h4.2M3.8 17.4h2.4" {...S} opacity="0.6" />
    </>
  ),
  docker: (
    <>
      <rect x="4.4" y="10.6" width="3.4" height="3.2" rx="0.7" {...S} />
      <rect x="8.6" y="10.6" width="3.4" height="3.2" rx="0.7" {...S} />
      <rect x="12.8" y="10.6" width="3.4" height="3.2" rx="0.7" {...S} />
      <rect x="8.6" y="6.8" width="3.4" height="3.2" rx="0.7" {...S} opacity="0.7" />
      <path d="M2.6 15.6h15.6a3.4 3.4 0 0 0 3.2-2.6c-1.2-.7-2.4-.6-3.4.2" {...S} />
      <path d="M3.4 15.6c.6 3 3 4.6 6.6 4.6 4.4 0 7.4-2 8.6-5.4" {...S} opacity="0.6" />
    </>
  ),
  cicd: (
    <>
      <path d="M20.2 12a8.2 8.2 0 0 1-13.9 5.9" {...S} />
      <path d="M3.8 12a8.2 8.2 0 0 1 13.9-5.9" {...S} />
      <path d="M17.7 2.6v3.5h-3.5M6.3 21.4v-3.5h3.5" {...S} />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" opacity="0.8" />
    </>
  ),
  git: (
    <>
      <circle cx="6" cy="6" r="2.2" {...S} />
      <circle cx="6" cy="18" r="2.2" {...S} />
      <circle cx="17.6" cy="10.4" r="2.2" {...S} />
      <path d="M6 8.2v7.6" {...S} />
      <path d="M15.6 11.6c-.6 2.9-3 4.2-9.6 4.2" {...S} opacity="0.75" />
    </>
  ),
};

export type TechGlyphName = keyof typeof glyphs;

export interface TechGlyphProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: string;
  className?: string;
}

/**
 * Renders a tech glyph by key. Unknown keys fall back to a neutral chip mark,
 * so adding a technology to the data file never breaks the render.
 */
export function TechGlyph({ name, className, ...props }: TechGlyphProps) {
  const glyph = glyphs[name] ?? (
    <>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4" {...S} />
      <circle cx="12" cy="12" r="2.4" {...S} opacity="0.7" />
    </>
  );

  // Only supply the default size when the caller hasn't sized it themselves.
  // Emitting both `size-6` and the caller's `size-5` lets stylesheet order pick
  // the winner, and Tailwind orders `size-6` last — so the default would win.
  const sized = /(?:^|\s)(?:size|[wh])-/.test(className ?? "");

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(!sized && "size-6", className)}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {glyph}
    </svg>
  );
}

export default TechGlyph;
