import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent, RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Mail, Phone } from "lucide-react";
import { cn } from "@/lib/cn";
import Button from "@/components/ui/Button";
import { navCta, navItems } from "@/config/navigation";
import { company } from "@/config/company";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const EASE = [0.22, 1, 0.36, 1] as const;

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } },
};

export interface MobileMenuProps {
  /** Id referenced by the toggle's `aria-controls`. */
  id: string;
  open: boolean;
  onClose: () => void;
  /** Section id currently owning the viewport. */
  activeId: string;
  /** The toggle button — focus returns here on close and joins the Tab cycle. */
  triggerRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Full-screen navigation drawer for viewports below `lg`.
 *
 * Renders inside the fixed header so the logo and the toggle (which doubles as
 * the close control) stay painted above the overlay. The toggle is therefore
 * part of the focus cycle even though it lives outside the dialog element.
 */
export function MobileMenu({ id, open, onClose, activeId, triggerRef }: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  /**
   * Navigate to a section from inside the drawer.
   *
   * This cannot be left to the browser. While the drawer is open the body is
   * locked with `overflow: hidden`, and a plain anchor click hands the jump to
   * the browser *while that lock is still applied* — the scroll is discarded,
   * the URL updates, and the page never moves. That is the whole bug: every
   * link in the mobile menu silently did nothing but close the drawer.
   *
   * So: close first, then scroll once the lock has actually been released.
   * Two frames, because the release happens in React's commit and the first
   * frame can still land inside it.
   */
  const goTo = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, href: string) => {
      // Let modified clicks (new tab, download) and non-anchor hrefs through.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!href.startsWith("#")) return;

      const target = document.getElementById(href.slice(1));
      if (!target) return; // Unknown anchor — the browser's fallback is fine.

      event.preventDefault();
      onClose();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const startY = window.scrollY;
          // `block: "start"` honours the `scroll-padding-top` on <html>, so the
          // heading clears the fixed header rather than hiding beneath it.
          target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
          window.history.replaceState(null, "", href);

          // Some browsers drop a smooth scroll issued in the same frame as a
          // layout change. If nothing moved, re-issue it instantly.
          window.setTimeout(() => {
            if (Math.abs(window.scrollY - startY) < 2) {
              target.scrollIntoView({ behavior: "auto", block: "start" });
            }
          }, 180);
        });
      });
    },
    [onClose, reducedMotion],
  );

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`;

    const trigger = triggerRef.current;
    const panel = panelRef.current;

    // Move focus into the panel — first link if there is one, the panel itself
    // otherwise (it carries tabIndex={-1} for exactly this case).
    const firstInPanel = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (firstInPanel ?? panel)?.focus();

    const cycle = (): HTMLElement[] => {
      const inPanel = panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
      return trigger ? [trigger, ...inPanel] : inPanel;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const nodes = cycle();
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement as HTMLElement | null;
      const inside = current !== null && nodes.includes(current);

      if (event.shiftKey) {
        if (!inside || current === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (!inside || current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
      // preventScroll matters: without it, returning focus to the header button
      // yanks the page back to the top and undoes the scroll a nav link just
      // started.
      trigger?.focus({ preventScroll: true });
    };
  }, [open, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ng-mobile-menu"
          className="fixed inset-0 z-10 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.26, ease: EASE }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-ng-ink/95 backdrop-blur-xl"
          />
          <div
            aria-hidden="true"
            className="ng-grid ng-fade-b pointer-events-none absolute inset-0 opacity-40"
          />

          {/* Scroll surface — a click on the empty area dismisses the drawer. */}
          <div
            className="ng-no-scrollbar absolute inset-0 overflow-y-auto"
            onClick={onClose}
          >
            <motion.div
              ref={panelRef}
              id={id}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              tabIndex={-1}
              onClick={(event) => event.stopPropagation()}
              className="relative mx-auto w-full max-w-[86rem] px-5 pb-14 pt-24 sm:px-6 sm:pt-28 focus:outline-none"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.34, ease: EASE }}
            >
              <motion.ul variants={listVariants} initial="hidden" animate="show">
                {navItems.map((item, index) => {
                  const isActive = item.id === activeId;
                  return (
                    <motion.li key={item.id} variants={itemVariants} className="border-b border-ng-line">
                      <a
                        href={item.href}
                        onClick={(event) => goTo(event, item.href)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group flex items-baseline gap-4 py-4 font-display text-2xl font-semibold sm:gap-5",
                          "transition-colors duration-300",
                          isActive ? "text-ng-fg" : "text-ng-fg2 hover:text-ng-fg",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "font-mono text-[0.6875rem] tracking-[0.2em] transition-colors duration-300",
                            isActive ? "text-ng-cyan" : "text-ng-faint group-hover:text-ng-cyan",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="size-1.5 shrink-0 self-center rounded-full bg-ng-cyan shadow-ng-glow-cyan"
                          />
                        )}
                      </a>
                    </motion.li>
                  );
                })}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.08 + navItems.length * 0.055, ease: EASE }}
                className="mt-9"
              >
                <Button
                  variant="primary"
                  size="lg"
                  arrow="right"
                  href={navCta.href}
                  onClick={(event: MouseEvent<HTMLAnchorElement>) => goTo(event, navCta.href)}
                  className="w-full"
                >
                  {navCta.label}
                </Button>

                <dl className="mt-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <dt className="sr-only">Email</dt>
                    <Mail aria-hidden="true" className="size-4 shrink-0 text-ng-faint" />
                    <dd className="min-w-0">
                      <a
                        href={`mailto:${company.contact.email}`}
                        className="break-all font-mono text-sm text-ng-muted transition-colors duration-300 hover:text-ng-cyan"
                      >
                        {company.contact.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <dt className="sr-only">Phone</dt>
                    <Phone aria-hidden="true" className="size-4 shrink-0 text-ng-faint" />
                    <dd>
                      <a
                        href={`tel:${company.contact.phoneHref}`}
                        className="font-mono text-sm text-ng-muted transition-colors duration-300 hover:text-ng-cyan"
                      >
                        {company.contact.phone}
                      </a>
                    </dd>
                  </div>
                </dl>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobileMenu;
