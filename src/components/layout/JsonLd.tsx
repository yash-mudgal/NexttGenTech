import { organizationJsonLd } from "@/config/site";

/**
 * schema.org Organization data, rendered from the same config that feeds the
 * rest of the site so the two can never drift apart.
 */
export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      // The payload is our own static config — no user input reaches this.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
    />
  );
}

export default JsonLd;
