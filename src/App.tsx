import { Suspense, lazy, useRef } from "react";
import JsonLd from "@/components/layout/JsonLd";
import SkipLink from "@/components/layout/SkipLink";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import { useWebGL } from "@/hooks";

/*
 * The shared 3D canvas is lazy so the `three` chunk never blocks first paint,
 * and gated on WebGL support + reduced-motion so it is not even requested by
 * visitors who cannot or should not see it.
 */
const Stage = lazy(() => import("@/components/3d/Stage"));

export function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { enabled } = useWebGL();

  return (
    <div ref={rootRef}>
      <SkipLink />
      <Navbar />
      <main id="main">
        <Home />
      </main>
      <Footer />

      {enabled && (
        <Suspense fallback={null}>
          <Stage eventSource={rootRef} />
        </Suspense>
      )}

      <JsonLd />
    </div>
  );
}

export default App;
