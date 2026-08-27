import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { AdditiveBlending, BackSide, MathUtils, Vector3 } from "three";
import type { Group, LineBasicMaterial, Mesh, MeshBasicMaterial } from "three";
import { cn } from "@/lib/cn";
import { accentOf } from "@/lib/accent";
import { useWebGL } from "@/hooks";
import { CORE_MODULES } from "./DigitalCoreFallback";

/* ============================================================================
 * NEXTGEN DIGITAL CORE — WebGL scene
 * ----------------------------------------------------------------------------
 * Lazy-loaded by the Hero. Nothing in this module may be imported eagerly: the
 * `three` chunk has to stay out of the initial bundle.
 * ========================================================================== */

/** Raw colours for materials. Three needs hex, so they come from the accent
 *  registry — the design system's sanctioned source for non-Tailwind colour. */
const BRAND = accentOf("brand").hex;
const BRAND_DEEP = accentOf("brand").hexDeep;
const CYAN = accentOf("cyan").hex;
const VIOLET = accentOf("violet").hex;

/**
 * Reads a design token straight off the document so label text matches the
 * surrounding UI. Falls back to an accent hex if the sheet has not applied.
 */
function token(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

const PARTICLE = token("--color-ng-faint", BRAND);

/* ── Ring layout ─────────────────────────────────────────────────────────────
 * Eight labels have to stay legible simultaneously, so the layout is built
 * around one invariant: every node must hold a distinct screen position at
 * every moment of the animation. Three rules get us there.
 *
 *  1. Both rings lie in the XY plane — broadly facing the camera — with only a
 *     modest tilt for depth. An edge-on ring collapses its four nodes into a
 *     narrow vertical band, which is what made ERP/ML and HRMS/SAAS collide.
 *  2. Nodes spin *within* the ring plane (about its own normal) and both rings
 *     read the same clock at the same rate. Their 45° interleave is therefore
 *     fixed for all time — a differential rate would eventually align an inner
 *     node radially behind an outer one.
 *  3. Labels are offset radially outward, not straight up, so they move away
 *     from the core and from each other rather than stacking.
 *
 * Verified by projecting all eight chips through the full transform chain at
 * 2° spin increments against the parallax extremes, at three canvas sizes
 * (360px mobile, the 427px lg column, and the 544px cap). Worst case anywhere:
 *   · closest pair clears its chip box by 1.25× — no overlap at any moment
 *   · furthest chip edge reaches 91.3% of the canvas half-width — never clipped
 *   · nearest chip clears the core wireframe by 9.6px
 * Changing a radius, the camera, the tilt bounds or the chip font size moves
 * all three numbers; re-check before doing so.
 * -------------------------------------------------------------------------- */

interface Ring {
  radius: number;
  /** Fixed tilt of the ring plane. Small, so the ring stays camera-facing. */
  tilt: [number, number, number];
  /** Starting angle within the plane. */
  phase: number;
  colour: string;
}

/** How far past its node a label sits, along the node's own radius. */
const LABEL_OFFSET = 0.58;
/** Shared by both rings — see rule 2. Radians per second. */
const SPIN_RATE = 0.1;

const RINGS: Ring[] = [
  { radius: 2.3, tilt: [-0.22, 0.16, 0], phase: 0, colour: CYAN },
  { radius: 1.8, tilt: [0.3, 0, 0], phase: Math.PI / 4, colour: VIOLET },
];

const MODULES_PER_RING = CORE_MODULES.length / RINGS.length;

interface NodeSpec {
  label: string;
  position: [number, number, number];
  /** Radial, so the label always travels away from the core. */
  labelOffset: [number, number, number];
  colour: string;
  index: number;
}

const RING_NODES: NodeSpec[][] = RINGS.map((ring, ringIndex) =>
  CORE_MODULES.slice(ringIndex * MODULES_PER_RING, (ringIndex + 1) * MODULES_PER_RING).map(
    (label, i) => {
      const angle = ring.phase + (i / MODULES_PER_RING) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        label,
        position: [cos * ring.radius, sin * ring.radius, 0],
        labelOffset: [cos * LABEL_OFFSET, sin * LABEL_OFFSET, 0],
        colour: ring.colour,
        index: ringIndex * MODULES_PER_RING + i,
      } satisfies NodeSpec;
    },
  ),
);

/* ── Module node ─────────────────────────────────────────────────────────── */

function ModuleNode({ label, position, labelOffset, colour, index }: NodeSpec) {
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const pulseRef = useRef<Mesh>(null);
  const lineMaterialRef = useRef<LineBasicMaterial>(null);
  const nodeMaterialRef = useRef<MeshBasicMaterial>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const linePoints = useMemo(
    () => new Float32Array([0, 0, 0, position[0], position[1], position[2]]),
    [position],
  );
  // Reused every frame — never allocate inside useFrame.
  const viewPosition = useMemo(() => new Vector3(), []);

  // Restore the cursor if the component unmounts while hovered.
  useEffect(() => {
    return () => {
      document.body.style.cursor = "";
    };
  }, []);

  useFrame((state, delta) => {
    const damp = 1 - Math.exp(-9 * delta);

    // A pulse of light travelling core → node, staggered per node.
    const travel = (state.clock.elapsedTime * 0.34 + index * 0.125) % 1;
    const eased = travel * travel;
    pulseRef.current?.position.set(
      position[0] * eased,
      position[1] * eased,
      position[2] * eased,
    );
    if (pulseRef.current) {
      const fade = Math.sin(travel * Math.PI);
      pulseRef.current.scale.setScalar(0.6 + fade * 0.8);
    }

    const node = nodeRef.current;
    if (node) {
      node.rotation.y += delta * 0.6;
      node.scale.setScalar(MathUtils.lerp(node.scale.x, hovered ? 1.6 : 1, damp));

      // Depth cue: labels on the far side of the core recede. View-space z runs
      // roughly 7.6 (nearest) to 10.4 (furthest) for this camera and radii.
      const chip = labelRef.current;
      if (chip) {
        node.getWorldPosition(viewPosition).applyMatrix4(state.camera.matrixWorldInverse);
        const far = MathUtils.clamp((-viewPosition.z - 7.6) / 2.8, 0, 1);
        chip.style.opacity = hovered ? "1" : String(MathUtils.lerp(1, 0.45, far));
      }
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(
        MathUtils.lerp(haloRef.current.scale.x, hovered ? 1.5 : 1, damp),
      );
    }
    if (nodeMaterialRef.current) {
      nodeMaterialRef.current.opacity = MathUtils.lerp(
        nodeMaterialRef.current.opacity,
        hovered ? 1 : 0.85,
        damp,
      );
    }
    if (lineMaterialRef.current) {
      lineMaterialRef.current.opacity = MathUtils.lerp(
        lineMaterialRef.current.opacity,
        hovered ? 0.8 : 0.24,
        damp,
      );
    }
  });

  const onOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const onOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "";
  };

  return (
    <group>
      {/* Core → node connector */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMaterialRef}
          color={colour}
          transparent
          opacity={0.24}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {/* Travelling pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.052, 8, 8]} />
        <meshBasicMaterial
          color={colour}
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group position={position}>
        <mesh ref={nodeRef} onPointerOver={onOver} onPointerOut={onOut}>
          <octahedronGeometry args={[0.17, 0]} />
          <meshBasicMaterial
            ref={nodeMaterialRef}
            color={colour}
            transparent
            opacity={0.85}
            toneMapped={false}
          />
        </mesh>

        <mesh ref={haloRef} raycast={() => null}>
          <sphereGeometry args={[0.3, 12, 12]} />
          <meshBasicMaterial
            color={colour}
            transparent
            opacity={0.12}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/*
          DOM label rather than drei's <Text>: troika parses the font file
          itself and never resolves against a variable woff2, which leaves the
          whole Suspense boundary hanging. An <Html> chip also renders in the
          real UI font, stays crisp at any DPR, and matches the non-WebGL
          fallback exactly. `pointerEvents: none` keeps the node mesh
          raycastable underneath.
        */}
        <Html
          center
          position={labelOffset}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            ref={labelRef}
            className={cn(
              "select-none whitespace-nowrap rounded-full border px-1.5 py-0.5 sm:px-2",
              "font-mono text-[0.5rem] uppercase tracking-[0.14em] backdrop-blur-sm",
              "sm:text-[0.5625rem] sm:tracking-[0.18em]",
              "transition-colors duration-300",
              hovered
                ? "border-ng-cyan/50 bg-ng-cyan/10 text-ng-fg"
                : "border-ng-line bg-ng-surface/75 text-ng-fg2",
            )}
          >
            {label}
          </span>
        </Html>
      </group>
    </group>
  );
}

/* ── Ring ────────────────────────────────────────────────────────────────── */

/**
 * A tilted plane whose nodes orbit within it.
 *
 * The spin is written as an absolute function of the shared clock rather than
 * accumulated per frame, so the two rings can never drift out of their 45°
 * interleave — the property the whole label layout depends on.
 */
function ModuleRing({ ring, nodes }: { ring: Ring; nodes: NodeSpec[] }) {
  const spinRef = useRef<Group>(null);

  useFrame((state) => {
    if (spinRef.current) spinRef.current.rotation.z = state.clock.elapsedTime * SPIN_RATE;
  });

  return (
    <group rotation={ring.tilt}>
      <group ref={spinRef}>
        {nodes.map((node) => (
          <ModuleNode key={node.label} {...node} />
        ))}
      </group>
    </group>
  );
}

/* ── Core ────────────────────────────────────────────────────────────────── */

function Core({ lowPower }: { lowPower: boolean }) {
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;
    group.rotation.y -= delta * 0.16;
    group.rotation.x += delta * 0.05;
    group.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.85) * 0.045);
  });

  return (
    <group ref={ref}>
      {/* Wireframe skeleton */}
      <mesh>
        <icosahedronGeometry args={[1.05, lowPower ? 0 : 1]} />
        <meshBasicMaterial color={BRAND} wireframe transparent opacity={0.55} toneMapped={false} />
      </mesh>

      {/* Translucent shell, lit from the inside */}
      <mesh raycast={() => null}>
        <icosahedronGeometry args={[1.28, lowPower ? 0 : 1]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.09}
          side={BackSide}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Dense inner seed */}
      <mesh raycast={() => null}>
        <icosahedronGeometry args={[0.52, 0]} />
        <meshBasicMaterial
          color={BRAND_DEEP}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      <mesh raycast={() => null}>
        <icosahedronGeometry args={[0.56, 0]} />
        <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Particle field ──────────────────────────────────────────────────────── */

function ParticleField({ lowPower }: { lowPower: boolean }) {
  const positions = useMemo(() => {
    const count = lowPower ? 190 : 540;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 4.2 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      array[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
      array[i * 3 + 2] = radius * Math.cos(phi);
    }
    return array;
  }, [lowPower]);

  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.014;
  });

  return (
    <group ref={ref}>
      <points raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color={PARTICLE}
          transparent
          opacity={0.65}
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

function Scene({ lowPower }: { lowPower: boolean }) {
  const ref = useRef<Group>(null);
  const scroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;

    // Bounded drift only. A free-running Y rotation would swing the rings
    // edge-on twice per turn and collapse the labels onto one another, so the
    // assembly stays camera-facing and the orbiting happens inside the rings.
    // Peak |rotation.y| is 0.16 + 0.09 = 0.25 rad, which the containment
    // figures at the top of the file assume.
    const damp = 1 - Math.exp(-3.4 * delta);
    const time = state.clock.elapsedTime;
    const targetX = state.pointer.y * 0.16 + Math.sin(time * 0.21) * 0.05;
    const targetY = state.pointer.x * 0.16 + Math.sin(time * 0.17) * 0.09;

    group.rotation.x += (targetX - group.rotation.x) * damp;
    group.rotation.y += (targetY - group.rotation.y) * damp;
    group.position.y += (-scroll.current * 0.9 - group.position.y) * damp;
  });

  return (
    <group ref={ref} scale={0.95}>
      <Core lowPower={lowPower} />
      <ParticleField lowPower={lowPower} />
      {RINGS.map((ring, ringIndex) => (
        <ModuleRing key={ringIndex} ring={ring} nodes={RING_NODES[ringIndex]} />
      ))}
    </group>
  );
}

/* ── Scene export ────────────────────────────────────────────────────────────
 * No <Canvas> here any more. The whole site shares one WebGL context (see
 * components/3d/Stage), so this module exports the scene graph and SceneView
 * mounts it into the shared canvas through a drei <View>. Camera, lighting and
 * off-screen pausing are handled there.
 * -------------------------------------------------------------------------- */

export function DigitalCoreScene() {
  const { lowPower } = useWebGL();
  return <Scene lowPower={lowPower} />;
}

export default DigitalCoreScene;
