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
 * A static site cannot send email itself and has nowhere safe to keep a
 * credential — anything in the bundle is readable by every visitor. So there
 * are three honest options, in descending order of quality:
 *
 *   mode: "worker" → POSTs JSON to our own Cloudflare Worker (see /worker),
 *                    which holds the API key as an encrypted secret and sends
 *                    the mail as info@nexttgentech.com, DKIM-signed. Best
 *                    deliverability and the sender is genuinely us.
 *   mode: "relay"  → POSTs form data to FormSubmit, a free third-party relay.
 *                    Works with no setup, but the mail arrives *from the
 *                    relay*, and its first-ever submission must be confirmed
 *                    by clicking a link emailed to the destination address.
 *   mode: "mailto" → opens the visitor's own mail client with a prefilled
 *                    draft. Nothing is sent on their behalf.
 */
export const contactForm = {
  mode: "worker" as "mailto" | "relay" | "worker",

  /**
   * Our Cloudflare Worker (source in /worker). Deployed 28 Aug 2026.
   *
   * Emptying this string is the kill switch: `mode: "worker"` falls straight
   * back to the relay below, so the form keeps delivering even if the Worker
   * is ever taken down. No other file needs touching.
   *
   * Redeploy with `cd worker && npm run deploy`. Setup and the DNS records
   * that authorise us to send as our own domain are in worker/README.md.
   */
  workerEndpoint: "https://nexttgentech-enquiry.nexttgentech-enquiry-worker.workers.dev",

  /**
   * Fallback relay, used while `workerEndpoint` is empty.
   *
   * ⚠️ ONE-TIME ACTIVATION: FormSubmit emails a confirmation link to the
   * address in this URL on the very first submission. Until someone clicks it,
   * nothing is delivered. Deploying the Worker makes this moot.
   */
  relayEndpoint: "https://formsubmit.co/yash.mudgal@nexttgentech.com",

  subjectPrefix: "[NextGen Enquiry]",
} as const;

/**
 * Resolves the three modes above into what the form should actually do,
 * degrading safely when a URL hasn't been filled in yet.
 */
export function resolveContactTransport(): {
  transport: "mailto" | "relay" | "worker";
  url: string;
} {
  const worker = contactForm.workerEndpoint.trim();
  const relay = contactForm.relayEndpoint.trim();

  if (contactForm.mode === "worker" && worker) return { transport: "worker", url: worker };
  if (contactForm.mode !== "mailto" && relay) return { transport: "relay", url: relay };
  return { transport: "mailto", url: "" };
}

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
