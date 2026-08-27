/* ============================================================================
 * LINK CONFIGURATION
 * ----------------------------------------------------------------------------
 * ⚠️  EVERY external URL used anywhere on the site lives here.
 *     Components must never hardcode a URL — import from this file instead.
 *
 *     Any link left as "#" is treated as "not configured yet": the UI keeps the
 *     card/button visible but renders it as a non-navigating, disabled control
 *     (see `isConfigured` below). Swap in the real URL and it activates itself.
 * ========================================================================== */

/** Live product / demo destinations. Replace each "#" with the real URL. */
export const productLinks = {
  schoolERP: "#", // «REPLACE» e.g. "https://school.nextgen.example"
  hospitalERP: "#", // «REPLACE»
  crm: "#", // «REPLACE»
  hrms: "#", // «REPLACE»
  inventory: "#", // «REPLACE»
  restaurantERP: "#", // «REPLACE»
} as const;

export type ProductLinkKey = keyof typeof productLinks;

/** Social profiles. Leave as "#" to render the icon in a muted, inert state. */
export const socialLinks = {
  linkedin: "#", // «REPLACE»
  instagram: "#", // «REPLACE»
  facebook: "#", // «REPLACE»
  github: "#", // «REPLACE»
  x: "#", // «REPLACE»
  youtube: "#", // «REPLACE»
} as const;

export type SocialKey = keyof typeof socialLinks;

/**
 * Where the contact form submits.
 *
 *   mode: "mailto"   → opens the visitor's mail client with a prefilled body.
 *                      Works with zero backend. This is the default.
 *   mode: "endpoint" → POSTs multipart form data to `endpoint`. Point this at
 *                      Formspree / Getform / Web3Forms / a Cloudflare Worker.
 *                      No server code lives in this repo either way.
 */
export const contactForm = {
  mode: "endpoint" as "mailto" | "endpoint",

  /**
   * Where enquiries are delivered.
   *
   * A static site cannot send email itself, so the form POSTs to FormSubmit,
   * a free relay that forwards each submission to the address in the URL —
   * here, yash.mudgal@nexttgentech.com. No account, no API key, no server.
   *
   * ⚠️ ONE-TIME ACTIVATION: the very first submission triggers a confirmation
   * email from FormSubmit to that address. Until someone clicks the link in it,
   * nothing is delivered. Send one test enquiry from the live site and confirm.
   *
   * The mail arrives from FormSubmit's servers, not from info@nexttgentech.com
   * — sending as your own domain needs SMTP credentials and a backend, which a
   * static site has nowhere to keep safely. Reply-To is set to the visitor's
   * address, so replying from the inbox still answers them directly.
   *
   * To switch providers later, replace this URL (Formspree, Getform and
   * Web3Forms all accept the same plain POST) or set mode back to "mailto".
   */
  endpoint: "https://formsubmit.co/yash.mudgal@nexttgentech.com",

  subjectPrefix: "[NextGen Enquiry]",
} as const;

/** In-page section anchors. Keep in sync with the section `id`s in Home.tsx. */
export const sectionIds = {
  home: "home",
  solutions: "solutions",
  products: "products",
  technologies: "technologies",
  ai: "ai",
  industries: "industries",
  leadership: "leadership",
  about: "about",
  contact: "contact",
} as const;

export type SectionId = (typeof sectionIds)[keyof typeof sectionIds];

/**
 * True when a URL has actually been configured.
 * Used by buttons/cards to decide between a real <a> and an inert control.
 */
export function isConfigured(url: string | undefined | null): boolean {
  return typeof url === "string" && url.trim() !== "" && url.trim() !== "#";
}

/** Props for opening an external link safely. Spread onto an <a>. */
export const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;
