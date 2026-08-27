import type { ReactElement } from "react";
import { cn } from "@/lib/cn";
import { company } from "@/config/company";
import { externalLinkProps, isConfigured, socialLinks } from "@/config/links";
import type { SocialKey } from "@/config/links";

/* ============================================================================
 * SOCIAL MARKS
 * ----------------------------------------------------------------------------
 * lucide-react v1 dropped its brand glyphs, so these are drawn here rather than
 * imported from a package that no longer exports them — simplified marks in the
 * same spirit as TechGlyph.
 *
 * This is the single source for social iconography: the footer, the contact
 * panel and the leadership cards all consume it.
 * ========================================================================== */

export interface GlyphProps {
  className?: string;
}

export function LinkedInGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.3 8.8h3.4V21H3.3V8.8Zm5.75 0h3.26v1.67h.05c.45-.86 1.56-1.76 3.21-1.76 3.43 0 4.06 2.17 4.06 5v7.29h-3.39v-6.46c0-1.54-.03-3.53-2.19-3.53-2.19 0-2.52 1.68-2.52 3.42V21H9.05V8.8Z" />
    </svg>
  );
}

export function InstagramGlyph({ className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5.2" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.1" cy="6.9" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.5 21v-8h2.71l.4-3.13H13.5V7.87c0-.9.25-1.52 1.55-1.52h1.66V3.56A22.4 22.4 0 0 0 14.3 3.44c-2.4 0-4.05 1.47-4.05 4.16V9.87H7.59V13h2.66v8h3.25Z" />
    </svg>
  );
}

export function GithubGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.49.09.67-.21.67-.47l-.01-1.85c-2.73.6-3.3-1.15-3.3-1.15-.45-1.13-1.09-1.43-1.09-1.43-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.87 1.5 2.29 1.07 2.85.82.09-.63.34-1.07.62-1.32-2.18-.25-4.47-1.09-4.47-4.85 0-1.07.38-1.95 1.01-2.63-.1-.25-.44-1.25.1-2.61 0 0 .82-.27 2.7 1.01a9.3 9.3 0 0 1 4.91 0c1.87-1.28 2.69-1.01 2.69-1.01.54 1.36.2 2.36.1 2.61.63.68 1.01 1.56 1.01 2.63 0 3.77-2.29 4.6-4.48 4.84.35.31.66.91.66 1.84l-.01 2.73c0 .26.18.57.68.47A9.8 9.8 0 0 0 12 2.2Z" />
    </svg>
  );
}

export function XGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-6.09l-4.77-6.23L5.44 21H2.42l7.06-8.07L2.25 3h6.24l4.31 5.7L17.53 3Zm-1.06 16.19h1.67L7.63 4.72H5.84l10.63 14.47Z" />
    </svg>
  );
}

export function YoutubeGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.02V8.98L15.2 12 10 15.02Z" />
    </svg>
  );
}

const glyphs: Record<SocialKey, (props: GlyphProps) => ReactElement> = {
  linkedin: LinkedInGlyph,
  instagram: InstagramGlyph,
  facebook: FacebookGlyph,
  github: GithubGlyph,
  x: XGlyph,
  youtube: YoutubeGlyph,
};

/** Human-readable network names, for `aria-label`s. */
export const socialLabels: Record<SocialKey, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  github: "GitHub",
  x: "X",
  youtube: "YouTube",
};

/** Order the profiles appear in, everywhere they appear. */
export const socialOrder: SocialKey[] = [
  "linkedin",
  "instagram",
  "facebook",
  "github",
  "x",
  "youtube",
];

export interface SocialIconProps extends GlyphProps {
  name: SocialKey;
}

/** A single social mark, by key. */
export function SocialIcon({ name, className }: SocialIconProps) {
  const Glyph = glyphs[name];
  return <Glyph className={cn("size-[1.0625rem]", className)} />;
}

export interface SocialRowProps {
  className?: string;
}

/**
 * Social profile row.
 *
 * Configured URLs become real external anchors; anything still left as "#" in
 * `socialLinks` renders muted and inert rather than as a dead link.
 */
export function SocialRow({ className }: SocialRowProps) {
  const shell =
    "grid size-11 place-items-center rounded-ng border border-ng-line " +
    "transition-[color,border-color,background-color] duration-300";

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {socialOrder.map((key) => {
        const url = socialLinks[key];
        const label = socialLabels[key];

        return (
          <li key={key}>
            {isConfigured(url) ? (
              <a
                href={url}
                {...externalLinkProps}
                aria-label={`${company.shortName} on ${label}`}
                className={cn(
                  shell,
                  "bg-white/[0.03] text-ng-fg2",
                  "hover:border-ng-cyan/45 hover:bg-ng-cyan/[0.08] hover:text-ng-cyan",
                )}
              >
                <SocialIcon name={key} />
              </a>
            ) : (
              <span
                aria-disabled="true"
                title={`${label} isn't linked yet — add the URL in src/config/links.ts`}
                className={cn(shell, "cursor-not-allowed bg-white/[0.015] text-ng-faint")}
              >
                <SocialIcon name={key} />
                <span className="sr-only">{label} — profile not linked yet</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default SocialIcon;
