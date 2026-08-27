import { sectionIds } from "./links";

export interface NavItem {
  label: string;
  /** Anchor href, e.g. "#products". */
  href: string;
  /** The section id used for active-state tracking. */
  id: string;
}

/** Primary navigation. Order here is the order in the navbar and mobile drawer. */
export const navItems: NavItem[] = [
  { label: "Home", href: `#${sectionIds.home}`, id: sectionIds.home },
  { label: "Solutions", href: `#${sectionIds.solutions}`, id: sectionIds.solutions },
  { label: "Products", href: `#${sectionIds.products}`, id: sectionIds.products },
  { label: "Technologies", href: `#${sectionIds.technologies}`, id: sectionIds.technologies },
  { label: "AI & Innovation", href: `#${sectionIds.ai}`, id: sectionIds.ai },
  { label: "Industries", href: `#${sectionIds.industries}`, id: sectionIds.industries },
  { label: "Leadership", href: `#${sectionIds.leadership}`, id: sectionIds.leadership },
  { label: "About", href: `#${sectionIds.about}`, id: sectionIds.about },
  { label: "Contact", href: `#${sectionIds.contact}`, id: sectionIds.contact },
];

/** Ids observed for the active-section indicator. */
export const navSectionIds = navItems.map((item) => item.id);

export const navCta = {
  label: "Explore Solutions",
  href: `#${sectionIds.solutions}`,
} as const;
