import { Suspense, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { PerspectiveCamera, View } from "@react-three/drei";
import { cn } from "@/lib/cn";
import { useWebGL } from "@/hooks";
import Rig from "./Rig";

/* ============================================================================
 * SECTION SCENE VIEW
 * ----------------------------------------------------------------------------
 * Reserves a box in the page layout and renders a 3D scene into exactly that
 * box, through the shared canvas in <Stage>.
 *
 * Three things every scene gets for free:
 *   · the shared lighting rig, so the whole site is lit consistently;
 *   · off-screen pausing — a View outside the viewport stops rendering, which
 *     is what makes ~9 simultaneous scenes affordable;
 *   · a designed 2D fallback for devices without WebGL and for visitors who
 *     have asked for reduced motion. The fallback is required, not optional:
 *     without it those visitors would see an empty gap where the scene sits.
 * ========================================================================== */

export interface SceneViewProps {
  /** The 3D content. Mounted inside a drei <View>. */
  children: ReactNode;
  /** Shown instead of the scene when WebGL is unavailable or motion is reduced. */
  fallback: ReactNode;
  /**
   * Sizing/positioning for the reserved box.
   *
   * ⚠️ It must resolve to a **definite** height — `h-80`, `aspect-square`, or a
   * grid/flex track. `min-h-*` alone is not enough: drei's <View> renders its
   * own full-size child div, and a block box with only a min-height collapses
   * it to zero, so the scene silently renders into a zero-height scissor and
   * you get a blank band with no error. If the fallback needs to grow past a
   * fixed height, make this box a `grid` so the View stretches into a definite
   * grid area while the fallback stays free to expand.
   */
  className?: string;
  /** Camera position. Defaults to a gentle 3/4 view. */
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  /** Keep rendering while off-screen. Only for scenes that must stay in sync. */
  alwaysRender?: boolean;
  /**
   * Lighting multiplier for the shared Rig.
   *
   * Note this only affects materials that respond to lights. Scenes built from
   * `meshBasicMaterial`, additive blending or vertex colours are unlit by
   * definition and will not dim — control their brightness with opacity or
   * colour instead.
   */
  lightIntensity?: number;
  /**
   * Receives the tracked box element. Useful when a section needs the scene's
   * own rect as a `useScroll` target, without wrapping it in another div.
   */
  boxRef?: RefObject<HTMLDivElement | null>;
}

export function SceneView({
  children,
  fallback,
  className,
  cameraPosition = [0, 0, 9],
  cameraFov = 45,
  alwaysRender = false,
  lightIntensity = 1,
  boxRef: externalBoxRef,
}: SceneViewProps) {
  const localBoxRef = useRef<HTMLDivElement>(null!);
  const boxRef = localBoxRef;
  // Mirror the box element out to a caller that needs it as a scroll target.
  useImperativeHandle(externalBoxRef, () => localBoxRef.current, []);
  const { enabled, ready } = useWebGL();
  const [near, setNear] = useState(false);

  // Only render a scene while its box is anywhere near the viewport. With this
  // many sections, rendering all of them every frame would be wasteful.
  useEffect(() => {
    const node = boxRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setNear(entry.isIntersecting),
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Until detection finishes, show the fallback — never an empty box.
  const show3D = ready && enabled;

  return (
    /*
     * `aria-hidden` applies only while a 3D scene is showing. A WebGL scene is
     * decorative — the meaning of every section lives in its text — but the
     * fallback is ordinary DOM that may legitimately contain focusable
     * controls, and hiding those would strand keyboard and screen-reader users
     * on exactly the devices that get the fallback.
     */
    <div
      ref={boxRef}
      aria-hidden={show3D ? "true" : undefined}
      className={cn("relative", className)}
    >
      {show3D ? (
        <View track={boxRef} visible={alwaysRender || near} className="size-full">
          <PerspectiveCamera makeDefault position={cameraPosition} fov={cameraFov} />
          <Rig intensity={lightIntensity} />
          <Suspense fallback={null}>{children}</Suspense>
        </View>
      ) : (
        fallback
      )}
    </div>
  );
}

export default SceneView;
