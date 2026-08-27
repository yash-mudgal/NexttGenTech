import { useEffect, useState } from "react";
import { useIsMobile, usePrefersReducedMotion } from "./useMediaQuery";

let cachedSupport: boolean | null = null;

/** One-time, cached WebGL capability probe. */
function detectWebGL(): boolean {
  if (cachedSupport !== null) return cachedSupport;
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    cachedSupport = Boolean(gl);
    // Release the probe context immediately — browsers cap concurrent contexts.
    const lose = (gl as WebGLRenderingContext | null)?.getExtension("WEBGL_lose_context");
    lose?.loseContext();
  } catch {
    cachedSupport = false;
  }
  return cachedSupport;
}

export interface WebGLStatus {
  /** The device can create a WebGL context. */
  supported: boolean;
  /** Detection has finished — render the fallback until this is true. */
  ready: boolean;
  /** Render 3D at all? False on reduced-motion or unsupported devices. */
  enabled: boolean;
  /** Draw fewer particles / lower DPR on small screens. */
  lowPower: boolean;
}

/**
 * Decides whether a 3D scene should mount.
 *
 * Detection runs in an effect so the first paint is never blocked by a canvas
 * probe, and every consumer must handle `ready === false` with a static
 * fallback. Reduced-motion visitors always get the fallback.
 */
export function useWebGL(): WebGLStatus {
  const [state, setState] = useState<{ supported: boolean; ready: boolean }>({
    supported: false,
    ready: false,
  });
  const reducedMotion = usePrefersReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Defer past the first paint so LCP is never blocked by the probe.
    const id = window.requestAnimationFrame(() => {
      setState({ supported: detectWebGL(), ready: true });
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  return {
    supported: state.supported,
    ready: state.ready,
    enabled: state.ready && state.supported && !reducedMotion,
    lowPower: isMobile,
  };
}
