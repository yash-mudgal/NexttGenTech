/* ============================================================================
 * SITE / SEO CONFIGURATION
 * ========================================================================== */

import { company } from "./company";

export const site = {
  /** Canonical origin, no trailing slash. «REPLACE» before deploying. */
  url: "https://www.nextgensoftwaretechnologies.com",

  title: "NextGen Software Technologies | ERP, CRM, HRMS, AI & Software Solutions",

  description:
    "NextGen Software Technologies builds modern ERP, CRM, HRMS, AI, SaaS, cloud and custom software solutions for businesses, schools, hospitals and enterprises.",

  keywords: [
    "School ERP",
    "Hospital ERP",
    "CRM software",
    "HRMS",
    "Inventory management software",
    "Restaurant ERP",
    "Custom software development",
    "SaaS development",
    "AI development",
    "Machine learning",
    "Cloud solutions",
    "React Native app development",
    ".NET development",
    "NextGen Software Technologies",
  ],

  locale: "en_IN",
  themeColor: "#04060c",

  /**
   * Open Graph / Twitter preview image, served from /public.
   * Currently the brand lockup; replace with a purpose-built 1200×630 card and
   * update the matching tags in index.html.
   */
  ogImage: "/brand/logo-lockup.png",

  twitterHandle: "", // «REPLACE» e.g. "@nextgensoft" — empty omits the tag

  /** Founding year used in the footer copyright line. */
  foundedYear: 2024, // «REPLACE» with the real year
} as const;

/**
 * schema.org Organization payload injected as JSON-LD.
 * Only fields we can actually stand behind are emitted.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    alternateName: company.shortName,
    url: site.url,
    logo: `${site.url}/brand/logo-mark.png`,
    description: site.description,
    slogan: company.tagline,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.contact.address.line2,
      addressCountry: company.contact.address.country,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: company.contact.salesEmail,
        telephone: company.contact.phoneHref,
        areaServed: "IN",
        availableLanguage: ["en", "hi"],
      },
    ],
    knowsAbout: [
      "Enterprise Resource Planning",
      "Customer Relationship Management",
      "Human Resource Management Systems",
      "Artificial Intelligence",
      "Machine Learning",
      "Cloud Computing",
      "SaaS",
    ],
  };
}
