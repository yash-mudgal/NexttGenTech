/* ============================================================================
 * LEADERSHIP
 * ----------------------------------------------------------------------------
 * ⚠️  NO REAL NAMES, BIOGRAPHIES OR CREDENTIALS HAVE BEEN INVENTED.
 *     Every field below is an editable placeholder. Replace the values, drop a
 *     photo into /public/assets/leadership/, and the cards update themselves.
 *
 *     • Add or remove entries freely — the section is fully data-driven.
 *     • `tier: "founding"` renders the large hero-style profile cards.
 *     • `tier: "leadership"` renders the compact grid below them.
 *     • If `image` is missing or fails to load, the card falls back to a
 *       generated monogram — it never shows a broken image.
 *     • Any field left empty is simply not rendered.
 * ========================================================================== */

export interface Leader {
  id: string;
  /** «REPLACE» — full name as it should appear publicly. */
  name: string;
  /** «REPLACE» — e.g. "Founder & CEO". */
  role: string;
  /** "founding" → large card. "leadership" → compact card. */
  tier: "founding" | "leadership";
  /** Path under /public. Leave "" to use the monogram fallback. */
  image: string;
  /** One-line professional specification, shown under the role. */
  specification: string;
  /** Short professional biography — 1–3 sentences. */
  bio: string;
  /** Expertise chips. */
  expertise: string[];
  /** e.g. "10+ years" — leave "" to hide. */
  experience: string;
  /** Full URL, or "#" while unconfigured. */
  linkedin: string;
  /** Leave "" to hide the mail button. */
  email: string;
}

export const leadership: Leader[] = [
  {
    id: "founder",
    name: "Yash Mudgal",
    role: "Founder & CEO",
    tier: "founding",
    image: "/assets/leadership/yash-mudgal.jpg",
    // «REPLACE» — the four fields below are still placeholder wording. They now
    // sit under a real name and photograph, so replace them with Yash's own
    // words before they read as fact.
    specification: "Software Architecture • Enterprise Applications • ERP • AI Strategy",
    bio: "Professional biography goes here. Describe the engineering background behind NextGen, the thinking that shaped its products, and the kind of systems the team builds.",
    expertise: [
      "Software Architecture",
      "Enterprise Applications",
      "ERP",
      "AI & Technology Strategy",
      "Business Strategy",
    ],
    experience: "", // «REPLACE» e.g. "12+ years" — empty hides the badge
    linkedin: "#", // «REPLACE» — renders as an inert locked control until set
    email: "", // «REPLACE» — empty hides the mail button
  },
  {
    id: "co-founder",
    name: "Co-Founder Name", // «REPLACE»
    role: "Co-Founder",
    tier: "founding",
    // «REPLACE» — e.g. "/assets/leadership/co-founder.jpg". See the note above.
    image: "",
    specification: "Technology • Product • Engineering Delivery",
    bio: "Professional biography goes here. Describe the co-founder's product and engineering focus and how they shape delivery at NextGen.", // «REPLACE»
    expertise: [
      "Product Development",
      "Technology",
      "Engineering",
      "Delivery Management",
    ], // «REPLACE»
    experience: "", // «REPLACE»
    linkedin: "#", // «REPLACE»
    email: "", // «REPLACE»
  },
  /* ── Add directors and technical leadership below. Duplicate a block, set
   *    tier: "leadership", and it appears in the compact grid.
   *
   * {
   *   id: "cto",
   *   name: "Name",
   *   role: "Chief Technology Officer",
   *   tier: "leadership",
   *   image: "",
   *   specification: "Cloud • Platform Engineering",
   *   bio: "",
   *   expertise: ["Cloud", "Platform"],
   *   experience: "",
   *   linkedin: "#",
   *   email: "",
   * },
   */
];

export const foundingTeam = leadership.filter((l) => l.tier === "founding");
export const leadershipTeam = leadership.filter((l) => l.tier === "leadership");

/** "Founder Name" → "FN". Used by the missing-image fallback. */
export function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
