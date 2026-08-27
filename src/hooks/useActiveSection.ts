import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently owning the viewport.
 *
 * Uses a rootMargin band just below the sticky navbar so a section becomes
 * "active" as its heading reaches reading position, not when its last pixel
 * scrolls in. Falls back to the first id before any intersection fires.
 */
export function useActiveSection(ids: readonly string[], offset = 96): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const visible = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        if (visible.size === 0) return;
        // Whichever tracked section occupies the most of the reading band wins.
        let best = "";
        let bestRatio = -1;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(best);
      },
      {
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    elements.forEach((el) => observer.observe(el));

    // Pin "home" while the page is scrolled to the very top.
    const onScroll = () => {
      if (window.scrollY < 24 && ids[0]) setActive(ids[0]);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids, offset]);

  return active;
}
