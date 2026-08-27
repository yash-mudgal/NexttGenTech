import { useId, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import MobileMenu from "./MobileMenu";
import { navCta, navItems, navSectionIds } from "@/config/navigation";
import { company } from "@/config/company";
import { useActiveSection, useScrolled } from "@/hooks";

/**
 * Sticky developer-platform navbar.
 *
 * Transparent over the hero, then fades in a frosted bar with a hairline
 * bottom border once the page moves. The active section drives a sliding pill
 * behind the current link, and a hairline progress rail sits on the bottom edge.
 *
 * Layout note: the centre rail and the CTA compete for the same horizontal
 * space between 1024px and 1279px — the CTA steps aside there so nine nav items
 * never push the bar into overflow. It returns at `xl`.
 */
export function Navbar() {
  const scrolled = useScrolled(24);
  const active = useActiveSection(navSectionIds);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.28 });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Frosted bar — faded in rather than swapped so the transition is smooth. */}
      <div
        aria-hidden="true"
        className={cn(
          "ng-glass pointer-events-none absolute inset-0 border-x-0 border-t-0",
          "transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "opacity-100 shadow-[0_14px_44px_-30px_rgb(0_0_0/0.95)]"
            : "opacity-0",
        )}
      />

      <MobileMenu
        id={menuId}
        open={open}
        activeId={active}
        triggerRef={toggleRef}
        onClose={() => setOpen(false)}
      />

      <div
        className={cn(
          "relative z-20 mx-auto flex w-full max-w-[86rem] items-center justify-between gap-4",
          "px-5 sm:px-6 lg:px-8 xl:px-10",
          "transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled ? "h-16 lg:h-[4.5rem]" : "h-20 lg:h-24",
        )}
      >
        <a
          href="#home"
          aria-label={`${company.name} — home`}
          className="shrink-0 rounded-ng-sm transition-opacity duration-300 hover:opacity-85"
        >
          <Logo size="sm" />
        </a>

        <nav aria-label="Primary" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {navItems.map((item) => {
              const isActive = item.id === active;
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex h-9 items-center whitespace-nowrap rounded-full px-2.5 xl:px-3",
                      "text-[0.8125rem] font-medium transition-colors duration-300",
                      isActive ? "text-ng-fg" : "text-ng-muted hover:text-ng-fg2",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="ng-nav-pill"
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-white/[0.06] ring-1 ring-inset ring-ng-line2"
                        transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.7 }}
                      />
                    )}
                    <span className="relative">{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/*
            The responsive display lives on this wrapper, not on the Button.
            Button's base class already sets `inline-flex`, and a `hidden` in
            its className has identical specificity — so the winner is decided
            by stylesheet order, not by the order they're written. On a phone
            that resolved to "visible", which shoved the menu toggle off the
            right edge and made navigation unreachable. A plain span has no
            competing display utility, so `hidden` reliably wins.
          */}
          <span className="hidden md:inline-flex lg:hidden xl:inline-flex">
            <Button variant="primary" size="sm" arrow="right" href={navCta.href}>
              {navCta.label}
            </Button>
          </span>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-full lg:hidden",
              "text-ng-fg2 ring-1 ring-inset ring-ng-line transition-colors duration-300",
              "hover:text-ng-fg hover:ring-ng-line2",
            )}
          >
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Reading progress — 2px, brand → cyan, anchored to the bottom hairline. */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-0.5 origin-left",
          "bg-gradient-to-r from-ng-brand-deep via-ng-brand to-ng-cyan",
          "transition-opacity duration-500",
          scrolled ? "opacity-90" : "opacity-0",
        )}
      />
    </header>
  );
}

export default Navbar;
