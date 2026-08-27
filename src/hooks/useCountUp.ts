import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

/**
 * Animates a number from 0 → `value` once the element scrolls into view.
 *
 * Non-numeric values (the "XX" metric placeholders, "₹4.7 Cr", "Ready") are
 * detected and returned verbatim — the counter never mangles a label.
 */
export function useCountUp(value: string, duration = 1400) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const numeric = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
  const isNumeric = /\d/.test(value) && Number.isFinite(numeric);
  const decimals = isNumeric ? (value.split(".")[1]?.match(/\d+/)?.[0].length ?? 0) : 0;

  const [display, setDisplay] = useState(() => (isNumeric && !reducedMotion ? "0" : value));

  useEffect(() => {
    if (!isNumeric || reducedMotion) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      // easeOutExpo — fast, then settles.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const current = numeric * eased;
      setDisplay(
        decimals > 0
          ? current.toFixed(decimals)
          : Math.round(current).toLocaleString("en-IN"),
      );
      if (t < 1) frame = window.requestAnimationFrame(tick);
      else setDisplay(value);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          frame = window.requestAnimationFrame(tick);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [value, duration, isNumeric, numeric, decimals, reducedMotion]);

  return { ref, display, isNumeric };
}
