import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor, Preload, View } from "@react-three/drei";

/* ============================================================================
 * SHARED 3D STAGE
 * ----------------------------------------------------------------------------
 * One WebGL context for the entire site.
 *
 * Every section's scene is a drei <View> tracked to a DOM box; this component
 * renders the single <Canvas> that hosts them all via <View.Port />. That
 * matters: browsers cap concurrent WebGL contexts at roughly 8–16, so giving
 * each of the ~9 3D sections its own <Canvas> would start silently dropping
 * scenes on real machines. One context also means one render loop, one set of
 * shared materials, and consistent lighting across the whole page.
 *
 * The canvas is fixed to the viewport and pointer-events-none. Each View
 * scissors its own tracked rectangle, so a scene only ever paints inside the
 * box its section reserved for it.
 * ========================================================================== */

export interface StageProps {
  /** The element pointer events are read from — normally the app root. */
  eventSource: React.RefObject<HTMLElement | null>;
}

export function Stage({ eventSource }: StageProps) {
  // Drop DPR under sustained load rather than dropping frames.
  const [dpr, setDpr] = useState(1.5);
  const declines = useRef(0);

  /*
   * The stage is lazy-loaded, so R3F takes its first measurement of this
   * container in the same frame the element is inserted — before layout has
   * resolved its size. It latches onto the canvas default of 300×150 and never
   * re-measures, because nothing resizes afterwards. One resize event on the
   * frame after mount forces a correct measurement.
   */
  useEffect(() => {
    const kick = () => window.dispatchEvent(new Event("resize"));
    // Two frames, then a late timeout: one rAF alone can still land before R3F
    // has attached its ResizeObserver, in which case the nudge is lost and the
    // canvas stays 300×150 for the life of the page.
    const f1 = requestAnimationFrame(() => {
      kick();
      requestAnimationFrame(kick);
    });
    const t = window.setTimeout(kick, 250);
    return () => {
      cancelAnimationFrame(f1);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <Canvas
      // `as never`: R3F types eventSource as a non-null ref, but the app root
      // ref is null on the very first render before the div mounts.
      eventSource={eventSource as never}
      eventPrefix="client"
      dpr={dpr}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        // Needed so scissored Views composite cleanly over the page.
        preserveDrawingBuffer: false,
      }}
      style={{
        // `inset: 0` alone sizes a fixed element to the viewport, with no unit
        // evaluation needed — more reliable at mount than 100vw/100dvh.
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        // Above section backgrounds so scenes are visible, below the navbar
        // (z-50) and the mobile drawer so UI is never occluded.
        zIndex: 10,
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          // Two sustained declines before we degrade, so a single janky
          // moment during scroll doesn't permanently reduce quality.
          declines.current += 1;
          if (declines.current >= 2) setDpr(1);
        }}
        onIncline={() => setDpr((d) => Math.min(2, d + 0.25))}
      />
      <AdaptiveDpr pixelated={false} />
      <Suspense fallback={null}>
        <View.Port />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}

/**
 * Tracks whether the shared stage has mounted, so section views can hold their
 * 2D fallback until there is a canvas to render into.
 */
export function useStageReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}

export default Stage;
