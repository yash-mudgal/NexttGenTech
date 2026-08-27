import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { usePrefersReducedMotion } from "./useMediaQuery";

export interface Pointer {
  /** -1 … 1, relative to the element (or viewport) centre. */
  x: number;
  y: number;
  inside: boolean;
}

const CENTRE: Pointer = { x: 0, y: 0, inside: false };

/**
 * Normalised pointer position for parallax and tilt effects.
 *
 * Tracks the viewport when `ref` is omitted. Updates are throttled to one per
 * animation frame, and always resolve to the centre for reduced-motion or
 * touch-only visitors so nothing jitters.
 */
export function usePointer(ref?: RefObject<HTMLElement | null>): Pointer {
  const [pointer, setPointer] = useState<Pointer>(CENTRE);
  const reducedMotion = usePrefersReducedMotion();
  const frame = useRef(0);
  const next = useRef<Pointer>(CENTRE);

  useEffect(() => {
    if (reducedMotion) {
      setPointer(CENTRE);
      return;
    }
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;

    const target = ref?.current ?? null;
    const node: HTMLElement | Window = target ?? window;

    const flush = () => {
      frame.current = 0;
      setPointer(next.current);
    };

    const onMove = (event: Event) => {
      const e = event as PointerEvent;
      const rect = target
        ? target.getBoundingClientRect()
        : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      next.current = {
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
        inside: true,
      };
      if (!frame.current) frame.current = window.requestAnimationFrame(flush);
    };

    const onLeave = () => {
      next.current = CENTRE;
      if (!frame.current) frame.current = window.requestAnimationFrame(flush);
    };

    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
      if (frame.current) window.cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [ref, reducedMotion]);

  return pointer;
}
