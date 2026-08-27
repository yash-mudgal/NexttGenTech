import { ArrowUp, ArrowUpRight, Mail, Phone } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { Aura } from "@/components/ui/Aura";
import { SocialRow } from "@/components/ui/SocialIcon";
import { company } from "@/config/company";
import { site } from "@/config/site";
import { externalLinkProps, isConfigured, productLinks, sectionIds } from "@/config/links";
import { products } from "@/data/products";
import { services } from "@/data/services";
import { databases, marqueeTech } from "@/data/technologies";

/* ── Sitemap ─────────────────────────────────────────────────────────────────
 * Every label below resolves from the data layer. Only the anchors and the
 * short display labels are authored here.
 * -------------------------------------------------------------------------- */

interface FooterLink {
  label: string;
  href: string;
  /** Opens in a new tab. Only ever true for configured product URLs. */
  external?: boolean;
  /** Longer name from the data layer, surfaced as a tooltip. */
  title?: string;
}

/** Live product URLs when configured, otherwise the on-page products section. */
const solutionLinks: FooterLink[] = products.map((product) => {
  const url = productLinks[product.link];
  return isConfigured(url)
    ? { label: product.name, href: url, external: true, title: product.tagline }
    : { label: product.name, href: `#${sectionIds.products}`, title: product.tagline };
});

/** Short labels, taken from `marqueeTech` so the footer and hero stay in step. */
const footerTechNames = [".NET", "React", "React Native", "Node.js", "Python", "AI", "ML"];

const technologyLinks: FooterLink[] = marqueeTech
  .filter((name) => footerTechNames.includes(name))
  .map((name) => ({ label: name, href: `#${sectionIds.technologies}` }));

const databaseLinks: FooterLink[] = databases.map((engine) => ({
  label: engine.name,
  href: `#${sectionIds.technologies}`,
  title: engine.role,
}));

/** Footer label → service id in @/data/services. */
const serviceMap: [label: string, id: string][] = [
  ["Software Development", "custom-software"],
  ["ERP", "erp-development"],
  ["AI", "ai-development"],
  ["Cloud", "cloud-solutions"],
  ["SaaS", "saas-development"],
  ["Mobile Apps", "mobile-development"],
  ["UI/UX", "ui-ux-design"],
  ["Branding", "brand-development"],
];

const serviceLinks: FooterLink[] = serviceMap.map(([label, id]) => ({
  label,
  // No `services` section id exists in `sectionIds` yet — Core Solutions is the
  // nearest real anchor, so these never resolve to a dead "#".
  href: `#${sectionIds.solutions}`,
  title: services.find((service) => service.id === id)?.title,
}));

const companyLinks: FooterLink[] = [
  { label: "About", href: `#${sectionIds.about}` },
  { label: "Leadership", href: `#${sectionIds.leadership}` },
  { label: "Industries", href: `#${sectionIds.industries}` },
  { label: "Contact", href: `#${sectionIds.contact}` },
];

interface FooterNavProps {
  id: string;
  heading: string;
  links: FooterLink[];
}

function FooterNav({ id, heading, links }: FooterNavProps) {
  return (
    <nav aria-labelledby={id}>
      <h2
        id={id}
        className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ng-faint"
      >
        {heading}
      </h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              title={link.title}
              {...(link.external ? externalLinkProps : {})}
              className="group/link inline-flex items-center gap-1.5 text-sm text-ng-muted transition-colors duration-300 hover:text-ng-cyan"
            >
              {link.label}
              {link.external && (
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3 shrink-0 opacity-60 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                />
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Site footer — the full sitemap plus the direct contact lines.
 *
 * Deliberately quieter than the page above it: a darker surface, one very faint
 * aura and a single gradient hairline along the top edge.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const copyrightYears =
    site.foundedYear >= year ? `${year}` : `${site.foundedYear}–${year}`;

  return (
    <footer className="relative isolate overflow-hidden border-t border-ng-line bg-ng-void">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ng-brand/40 to-transparent" />
        <Aura
          tone="brand"
          size="size-[46rem]"
          opacity={9}
          blur="blur-[120px]"
          className="-bottom-[26rem] left-1/2 -translate-x-1/2"
        />
      </div>

      <div className="mx-auto w-full max-w-[86rem] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8 lg:py-20">
          {/* ── Brand ──────────────────────────────────────────────────── */}
          <div className="sm:col-span-2">
            <a
              href={`#${sectionIds.home}`}
              className="inline-flex rounded-ng-sm"
              aria-label={`${company.name} — back to top`}
            >
              <Logo size="md" />
            </a>

            <p className="mt-6 text-sm text-ng-muted">
              Software Engineering • ERP • CRM • HRMS • AI • Cloud • SaaS
            </p>

            {/* No line-clamp: the sentence is short enough to show in full, and
                clamping cut it mid-word ("…accelerat…"), which reads as broken. */}
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ng-muted">
              {company.description}
            </p>

            <SocialRow className="mt-7" />
          </div>

          {/* ── Sitemap ────────────────────────────────────────────────── */}
          <FooterNav id="footer-solutions" heading="Solutions" links={solutionLinks} />

          <div className="space-y-8">
            <FooterNav
              id="footer-technologies"
              heading="Technologies"
              links={technologyLinks}
            />
            <FooterNav id="footer-databases" heading="Databases" links={databaseLinks} />
          </div>

          <FooterNav id="footer-services" heading="Services" links={serviceLinks} />
          <FooterNav id="footer-company" heading="Company" links={companyLinks} />
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 border-t border-ng-line py-7 text-sm text-ng-muted lg:flex-row lg:items-center lg:justify-between">
          <p className="order-2 lg:order-1">
            © {copyrightYears} {company.name}. All rights reserved.
          </p>

          <div className="order-1 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6 lg:order-2">
            <a
              href={`mailto:${company.contact.email}`}
              className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-ng-cyan"
            >
              <Mail aria-hidden="true" className="size-3.5 shrink-0 text-ng-faint" />
              <span className="break-all">{company.contact.email}</span>
            </a>

            <a
              href={`tel:${company.contact.phoneHref}`}
              className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-ng-cyan"
            >
              <Phone aria-hidden="true" className="size-3.5 shrink-0 text-ng-faint" />
              {company.contact.phone}
            </a>

            <a
              href={`#${sectionIds.home}`}
              className="group/top inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-ng-faint transition-colors duration-300 hover:text-ng-cyan"
            >
              Back to top
              <ArrowUp
                aria-hidden="true"
                className="size-3.5 shrink-0 transition-transform duration-300 group-hover/top:-translate-y-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
