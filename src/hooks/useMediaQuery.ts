import { useEffect, useState } from "react";

/** Subscribe to a CSS media query. SSR/no-window safe. */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return defaultValue;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** True when the viewport is below the `md` breakpoint (768px). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** True when the viewport is below the `lg` breakpoint (1024px). */
export function useIsTablet(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

/** True when the primary input is coarse (touch). */
export function useIsTouch(): boolean {
  return useMediaQuery("(pointer: coarse)");
}

/** True when the visitor has asked for reduced motion. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
