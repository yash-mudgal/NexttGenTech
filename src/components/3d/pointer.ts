import { useEffect, useRef } from "react";
import type { RefObject } from "react";

/* ============================================================================
 * SHARED SCENE POINTER
 * ----------------------------------------------------------------------------
 * Why this exists instead of R3F's `state.pointer`:
 *
 * drei's <View> calls `rootState.setEvents({ connected: track.current })` when
 * it mounts, and every View shares one root state. With several Views on the
 * page, only the last one to mount stays connected — so `state.pointer` updates
 * in exactly one scene and silently reads as centred in all the others. Parallax
 * would work on one section and be dead everywhere else, with no error.
 *
 * A single window-level listener sidesteps the whole problem and costs one
 * passive handler for the entire site.
 *
 * Values are normalised to -1…1 against the viewport, matching R3F's convention
 * (x right-positive, y up-positive). Read through a ref inside useFrame so a
 * pointer move never triggers a React render.
 * ========================================================================== */

const pointer = { x: 0, y: 0 };

let listening = false;
let subscribers = 0;

function onPointerMove(event: PointerEvent) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  // Negated: DOM y grows downward, world y grows upward.
  pointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
}

/** Recentre when the pointer leaves the window, so scenes settle back. */
function onPointerOut(event: PointerEvent) {
  if (event.relatedTarget === null) {
    pointer.x = 0;
    pointer.y = 0;
  }
}

function subscribe() {
  subscribers += 1;
  if (listening || typeof window === "undefined") return;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerout", onPointerOut, { passive: true });
  listening = true;
}

function unsubscribe() {
  subscribers = Math.max(0, subscribers - 1);
  if (subscribers > 0 || !listening) return;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerout", onPointerOut);
  listening = false;
  pointer.x = 0;
  pointer.y = 0;
}

/**
 * Normalised pointer position for parallax, as a stable ref.
 *
 * ```tsx
 * const p = useScenePointer();
 * useFrame(() => {
 *   group.current.rotation.y += (p.current.x * 0.2 - group.current.rotation.y) * 0.05;
 * });
 * ```
 *
 * Touch devices simply leave it at the centre, which is the correct resting
 * state — scenes should still animate on their own without it.
 */
export function useScenePointer(): RefObject<{ x: number; y: number }> {
  const ref = useRef(pointer);
  useEffect(() => {
    subscribe();
    return unsubscribe;
  }, []);
  return ref;
}
