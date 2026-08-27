/* ============================================================================
 * COMPANY CONFIGURATION — SINGLE SOURCE OF TRUTH
 * ----------------------------------------------------------------------------
 * ⚠️  EDIT THIS FILE to update company details across the entire website.
 *     Nothing below is duplicated anywhere else in the codebase.
 *
 *     Values marked  «REPLACE»  are editable placeholders — no real-world
 *     figures or credentials have been invented. Fill them in before launch.
 * ========================================================================== */

export const company = {
  name: "NextGen Software Technologies",
  shortName: "NextGen",
  /** Rendered as the wordmark in the navbar / footer. */
  logoMark: "NEXTGEN",
  logoSub: "Software Technologies",

  tagline: "We Build Software That Moves Businesses Forward.",
  pitchLine: "ERP • CRM • HRMS • AI • SaaS • Cloud • Digital Products",

  description:
    "NextGen Software Technologies builds scalable software systems, intelligent business applications and digital products that simplify operations and accelerate growth.",

  /** Longer paragraph used by the About section. */
  about:
    "NextGen Software Technologies is a product-focused software engineering company. We design and build ERP platforms, business applications, SaaS products and AI-enabled systems for schools, hospitals, retailers, manufacturers and growing enterprises. Our work starts with the operational reality of a business — the workflows, the people and the data — and ends with software that is genuinely used every day.",

  /** Badges taken from the brand lockup. */
  badges: ["Software Solutions", "SaaS", "Product Based", "Subscription Based"],

  /* ── Contact ─────────────────────────────────────────────────────────── */
  contact: {
    email: "info@nexttgentech.com",
    /**
     * Where the contact form addresses its enquiry.
     *
     * Deliberately the same inbox as `email`: a dedicated sales@ or careers@
     * address has not been confirmed to exist, and pointing the form at one
     * that doesn't would drop every enquiry silently. Split these out only
     * once those mailboxes are real.
     */
    salesEmail: "info@nexttgentech.com",
    careersEmail: "info@nexttgentech.com",
    phone: "+91 96229 68107",
    /** Digits only — used to build the tel: href. */
    phoneHref: "+919622968107",
    // «REPLACE» digits only, e.g. "919622968107". Empty hides the button.
    // Left unset because it hasn't been confirmed that this number is on
    // WhatsApp — a dead wa.me link is worse than no button.
    whatsapp: "",
    address: {
      line1: "Registered Office", // «REPLACE»
      line2: "City, State", // «REPLACE»
      country: "India", // «REPLACE»
    },
    /** Business hours shown beside the contact form. */
    hours: "Mon – Sat · 10:00 – 19:00 IST", // «REPLACE»
  },

  /* ── Metrics ─────────────────────────────────────────────────────────────
   * Deliberately left as placeholders — no statistics have been invented.
   * Replace `value` with the real figure (keep it a string so "50+", "12" and
   * "4.9" all work). Set `enabled: false` to hide the metrics band entirely
   * until you have numbers you're happy to publish.
   * ------------------------------------------------------------------------ */
  metrics: {
    enabled: true,
    items: [
      { value: "XX", suffix: "+", label: "Projects Delivered", hint: "Across ERP, SaaS & custom builds" },
      { value: "XX", suffix: "+", label: "Clients Served", hint: "Schools, hospitals & enterprises" },
      { value: "XX", suffix: "+", label: "Products Built", hint: "Shipped platforms & modules" },
      { value: "XX", suffix: "+", label: "Industries", hint: "Verticals we engineer for" },
      { value: "XX", suffix: "+", label: "Years Experience", hint: "Combined engineering practice" },
    ],
  },

  /* ── Why NextGen ─────────────────────────────────────────────────────── */
  differentiators: [
    {
      title: "Product Mindset",
      body: "We build software products, not just features. Every module is designed to hold up under years of real use.",
      icon: "package",
    },
    {
      title: "Scalable Architecture",
      body: "Systems are designed to grow with the business — more users, more branches, more data, without a rewrite.",
      icon: "layers",
    },
    {
      title: "AI Ready",
      body: "Modern systems structured for intelligent integrations, so AI can be added where it genuinely helps.",
      icon: "sparkles",
    },
    {
      title: "Enterprise Focus",
      body: "Built around real operational workflows — approvals, roles, audit trails and the exceptions that matter.",
      icon: "building",
    },
    {
      title: "User First",
      body: "Simple, practical experiences. Software that a receptionist, a teacher or a store manager can use on day one.",
      icon: "users",
    },
    {
      title: "Technology Driven",
      body: "Modern development practices, code review, automated testing and AI-assisted engineering workflows.",
      icon: "cpu",
    },
  ],

  /* ── Delivery process ────────────────────────────────────────────────── */
  process: [
    { step: "01", title: "Discover", body: "Understand the business, its workflows, its people and where the friction actually is.", icon: "search" },
    { step: "02", title: "Design", body: "Map workflows, information architecture and interface design before a line of code is written.", icon: "pen-tool" },
    { step: "03", title: "Architect", body: "Design a scalable technical foundation — data model, services, integrations and security.", icon: "network" },
    { step: "04", title: "Develop", body: "Build the product in reviewable increments with AI-assisted engineering workflows.", icon: "code" },
    { step: "05", title: "Test", body: "Validate quality — functional, integration, performance and user-acceptance testing.", icon: "shield-check" },
    { step: "06", title: "Deploy", body: "Launch to cloud infrastructure with CI/CD, monitoring and a rollback path.", icon: "rocket" },
    { step: "07", title: "Evolve", body: "Measure, support and improve continuously as the business changes.", icon: "refresh-cw" },
  ],
} as const;

export type Company = typeof company;
