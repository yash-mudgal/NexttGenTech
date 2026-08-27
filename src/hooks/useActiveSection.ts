import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently owning the reading position.
 *
 * Two deliberate choices here, both the result of real failures:
 *
 * 1. **Scroll position, not IntersectionObserver.** The original version
 *    observed each section with a narrow rootMargin band and picked the
 *    highest `intersectionRatio`. That breaks once sections grow taller than
 *    the band — a 2,600px section overlapping a 188px band has a ratio of
 *    ~0.07, under the lowest threshold, so the observer only fired on the
 *    0-crossing. Scrolling through a tall section produced no callbacks and the
 *    indicator froze. Comparing tops against a reading line is correct for a
 *    section of any height.
 *
 * 2. **No requestAnimationFrame.** rAF does not fire in a background or hidden
 *    tab, which silently freezes the indicator. Section offsets are measured
 *    once up front instead, so the scroll handler is pure arithmetic — cheaper
 *    than a rAF-throttled handler that re-measures, and it cannot stall.
 */
export function useActiveSection(ids: readonly string[], offset = 96): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    if (typeof window === "undefined") return;

    /** Document-space top of each section, measured outside the scroll path. */
    let tops: { id: string; top: number }[] = [];

    const measure = () => {
      tops = ids
        .map((id) => {
          const el = document.getElementById(id);
          if (!el) return null;
          return { id, top: el.getBoundingClientRect().top + window.scrollY };
        })
        .filter((entry): entry is { id: string; top: number } => entry !== null);
      update();
    };

    function update() {
      const line = window.scrollY + offset + 1;

      // At the very bottom the final section may be too short to reach the
      // line, so award it explicitly once there is nothing left to scroll.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        const last = tops[tops.length - 1];
        if (last) setActive(last.id);
        return;
      }

      let current = tops[0]?.id ?? ids[0] ?? "";
      for (const entry of tops) {
        if (entry.top <= line) current = entry.id;
        else break; // measured in document order
      }
      setActive(current);
    }

    measure();
    // Sections shift as lazy content (3D scenes, fonts, images) settles.
    const remeasure = window.setTimeout(measure, 1200);

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure, { passive: true });

    /*
     * Belt and braces. Scroll events are the primary signal, but they are not
     * guaranteed: some automated and embedded contexts change scrollY without
     * dispatching them. An observer with a single 0 threshold fires on its own
     * schedule as sections cross the viewport edge, so it recovers the
     * indicator if scroll events are missing. Its *ratio* is deliberately
     * unused — that is precisely what made the previous implementation fail on
     * sections taller than the observation band; it only serves as a nudge to
     * re-run the same position arithmetic.
     */
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      // Re-measure rather than just recompute: a section crossing the viewport
      // edge is also the moment lazy content is most likely to have changed
      // heights above it, which would leave the cached tops stale.
      observer = new IntersectionObserver(() => measure(), { threshold: 0 });
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    }

    return () => {
      window.clearTimeout(remeasure);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [ids, offset]);

  return active;
}
