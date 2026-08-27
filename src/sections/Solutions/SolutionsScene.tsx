import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import { AdditiveBlending, BackSide, MathUtils } from "three";
import type {
  Group,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
} from "three";
import { useWebGL } from "@/hooks";
import { products } from "@/data/products";
import { C, accentHex } from "@/components/3d/palette";

/* ============================================================================
 * CORE SOLUTIONS — MODULE LATTICE
 * ----------------------------------------------------------------------------
 * Lazy-loaded by the Solutions section. Nothing here may be imported eagerly:
 * the `three` chunk has to stay out of the initial bundle.
 *
 * One cluster per platform, each a small lattice of instanced cubes tinted with
 * that product's accent — modules composing a platform. Every cluster is wired
 * back to a single node below the row, which is the whole argument of the
 * section: six complete platforms, one engineering core.
 *
 * Hovering a card brightens and grows its cluster. That is an enhancement on
 * top of a scene that already reads on its own — the cards remain entirely
 * usable with a keyboard, on touch, and with no WebGL at all.
 * ========================================================================== */

/** Deterministic 0–1 sequence — the lattice is a composition, not noise. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** The shared node every cluster connects to. Sits below the row so the spokes
 *  fan upward and stay legible across a very wide banner. */
const CORE: [number, number, number] = [0, -1.7, -0.4];

interface Slot {
  /** Horizontal placement, as a fraction of the scene's usable half-width. */
  xf: number;
  y: number;
  z: number;
  /** Radians per second the cluster turns about its own axis. */
  spin: number;
}

/**
 * Placement per platform, positional to match the order `products` is authored
 * in — the same convention the card grid uses. Alternating depth and height
 * keep six clusters distinguishable without spreading them so far that the
 * outer two leave the banner on a phone.
 */
const SLOTS: Slot[] = [
  { xf: -1, y: 0.42, z: -1.3, spin: 0.11 },
  { xf: -0.6, y: -0.16, z: 0.75, spin: -0.09 },
  { xf: -0.2, y: 0.55, z: -0.5, spin: 0.13 },
  { xf: 0.2, y: -0.1, z: 0.95, spin: -0.12 },
  { xf: 0.6, y: 0.48, z: -1.05, spin: 0.1 },
  { xf: 1, y: -0.2, z: 0.45, spin: -0.14 },
];

const LAST_SLOT: Slot = SLOTS[SLOTS.length - 1];

/** Cube grid for one cluster: 3 × 3 × 2 with roughly a quarter carved out, so
 *  it reads as an assembled structure rather than a solid block. */
const LATTICE: [number, number, number][] = (() => {
  const random = seeded(4211);
  const cells: [number, number, number][] = [];
  for (let x = -1; x <= 1; x += 1) {
    for (let y = 0; y < 3; y += 1) {
      for (let z = -1; z <= 1; z += 2) {
        if (random() < 0.26) continue;
        cells.push([x * 0.34, y * 0.3 - 0.3, z * 0.17]);
      }
    }
  }
  return cells;
})();

/* ── Visible width ───────────────────────────────────────────────────────── */

/**
 * Half the world-space width visible at z = 0, read from the live camera and
 * the tracked box's own size. The banner's aspect ratio changes by nearly 3×
 * between a phone and a desktop, so every horizontal figure is a fraction of
 * this rather than a fixed world coordinate.
 */
function useHalfWidth(): number {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);

  return useMemo(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const perspective = camera as PerspectiveCamera;
    if (!perspective.isPerspectiveCamera) return 4 * aspect;
    const halfHeight =
      perspective.position.z * Math.tan(MathUtils.degToRad(perspective.fov / 2));
    return halfHeight * aspect;
  }, [camera, size]);
}

/* ── Cluster ─────────────────────────────────────────────────────────────── */

interface ClusterProps {
  slot: Slot;
  hex: string;
  /** Position in the fan, used to stagger the travelling pulse. */
  index: number;
  spread: number;
  scale: number;
  /** True while the matching card is hovered or focused. */
  active: boolean;
}

function Cluster({ slot, hex, index, spread, scale, active }: ClusterProps) {
  const bodyRef = useRef<Group>(null);
  const cubeRef = useRef<MeshStandardMaterial>(null);
  const baseRef = useRef<MeshStandardMaterial>(null);
  const spokeRef = useRef<LineBasicMaterial>(null);
  const pulseRef = useRef<Mesh>(null);

  const position = useMemo<[number, number, number]>(
    () => [slot.xf * spread, slot.y, slot.z],
    [slot, spread],
  );

  const spoke = useMemo(
    () => new Float32Array([...CORE, ...position]),
    [position],
  );

  /*
   * Emissive strength and spoke opacity are seeded once and animated from then
   * on — they are deliberately not props. A prop is re-applied on every
   * re-render, and the re-render here *is* the hover change, so the value would
   * snap back to its resting state the instant the transition should start.
   */
  useLayoutEffect(() => {
    if (cubeRef.current) cubeRef.current.emissiveIntensity = 0.22;
    if (baseRef.current) baseRef.current.emissiveIntensity = 0.3;
    if (spokeRef.current) spokeRef.current.opacity = 0.22;
    bodyRef.current?.scale.setScalar(scale);
    // Mount only: these are initial values, not dependencies.
  }, []);

  useFrame((state, delta) => {
    const damp = 1 - Math.exp(-7 * delta);
    const time = state.clock.elapsedTime;

    const body = bodyRef.current;
    if (body) {
      body.rotation.y += delta * slot.spin;
      body.position.y = slot.y + Math.sin(time * 0.5 + index * 1.1) * 0.12;
      body.scale.setScalar(
        MathUtils.lerp(body.scale.x, (active ? 1.16 : 1) * scale, damp),
      );
    }

    if (cubeRef.current) {
      cubeRef.current.emissiveIntensity = MathUtils.lerp(
        cubeRef.current.emissiveIntensity,
        active ? 0.85 : 0.22,
        damp,
      );
    }
    if (baseRef.current) {
      baseRef.current.emissiveIntensity = MathUtils.lerp(
        baseRef.current.emissiveIntensity,
        active ? 1.1 : 0.3,
        damp,
      );
    }
    if (spokeRef.current) {
      spokeRef.current.opacity = MathUtils.lerp(
        spokeRef.current.opacity,
        active ? 0.7 : 0.22,
        damp,
      );
    }

    // A pulse of light travelling core → cluster, staggered per platform.
    const pulse = pulseRef.current;
    if (pulse) {
      const travel = (time * 0.28 + index * 0.16) % 1;
      const eased = travel * travel;
      pulse.position.set(
        CORE[0] + (position[0] - CORE[0]) * eased,
        CORE[1] + (position[1] - CORE[1]) * eased,
        CORE[2] + (position[2] - CORE[2]) * eased,
      );
      pulse.scale.setScalar(0.6 + Math.sin(travel * Math.PI) * 0.7);
    }
  });

  return (
    <group>
      {/* Core → cluster spoke */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[spoke, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={spokeRef}
          color={hex}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {/* Travelling pulse */}
      <mesh ref={pulseRef}>
        <octahedronGeometry args={[0.055, 0]} />
        <meshBasicMaterial
          color={hex}
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Y and scale are animated, so only the axes React owns are set here —
          a full `position`/`scale` prop would be re-applied on every hover
          change and jump the cluster back to its resting transform. */}
      <group ref={bodyRef} position-x={position[0]} position-z={position[2]}>
        {/* Module lattice */}
        <Instances limit={LATTICE.length}>
          <boxGeometry args={[0.24, 0.24, 0.24]} />
          <meshStandardMaterial
            ref={cubeRef}
            color={hex}
            emissive={hex}
            roughness={0.35}
            metalness={0.35}
          />
          {LATTICE.map((cell, i) => (
            <Instance key={i} position={cell} />
          ))}
        </Instances>

        {/* Platform plate the modules stand on */}
        <mesh position={[0, -0.52, 0]}>
          <boxGeometry args={[1.16, 0.045, 0.72]} />
          <meshStandardMaterial
            ref={baseRef}
            color={hex}
            emissive={hex}
            roughness={0.25}
            metalness={0.5}
          />
        </mesh>
      </group>
    </group>
  );
}

/* ── Shared core ─────────────────────────────────────────────────────────── */

function SharedCore() {
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;
    group.rotation.y += delta * 0.18;
    group.rotation.x -= delta * 0.06;
    group.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.05);
  });

  return (
    <group ref={ref} position={CORE}>
      <mesh>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshBasicMaterial color={C.brand} wireframe transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[0.24, 0]} />
        <meshStandardMaterial
          color={C.brandDeep}
          emissive={C.brand}
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      {/* Halo, lit from the inside so the node reads as the light source. */}
      <mesh>
        <sphereGeometry args={[0.72, 16, 16]} />
        <meshBasicMaterial
          color={C.cyan}
          transparent
          opacity={0.07}
          side={BackSide}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ── Lattice web ─────────────────────────────────────────────────────────── */

/** Hairlines chaining neighbouring clusters, so the six read as one structure
 *  rather than six separate objects sharing a background. */
function Web({ positions }: { positions: [number, number, number][] }) {
  const segments = useMemo(() => {
    const array = new Float32Array(Math.max(positions.length - 1, 0) * 6);
    for (let i = 0; i < positions.length - 1; i += 1) {
      array.set([...positions[i], ...positions[i + 1]], i * 6);
    }
    return array;
  }, [positions]);

  if (segments.length === 0) return null;

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[segments, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color={C.line}
        transparent
        opacity={0.55}
        depthWrite={false}
        toneMapped={false}
      />
    </lineSegments>
  );
}

/* ── Ambient dust ────────────────────────────────────────────────────────── */

function DustField({ count, spread }: { count: number; spread: number }) {
  const ref = useRef<Group>(null);

  const positions = useMemo(() => {
    const random = seeded(90210);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (random() * 2 - 1) * (spread + 1.4);
      array[i * 3 + 1] = (random() * 2 - 1) * 2.1;
      array[i * 3 + 2] = (random() * 2 - 1) * 2.6;
    }
    return array;
  }, [count, spread]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.016;
  });

  return (
    <group ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.032}
          color={C.fg}
          transparent
          opacity={0.4}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

function Lattice({ hovered, lowPower }: { hovered: string | null; lowPower: boolean }) {
  const rootRef = useRef<Group>(null);

  const halfWidth = useHalfWidth();
  const spread = MathUtils.clamp(halfWidth * 0.56, 1.7, 5.4);
  const scale = MathUtils.clamp(halfWidth / 8, 0.55, 1);

  const positions = useMemo(
    () =>
      products.map<[number, number, number]>((_, index) => {
        const slot = SLOTS[index] ?? LAST_SLOT;
        return [slot.xf * spread, slot.y, slot.z];
      }),
    [spread],
  );

  useFrame((state, delta) => {
    const group = rootRef.current;
    if (!group) return;

    /*
     * Bounded sway plus a slow vertical float — never a free-running Y
     * rotation. The clusters are laid out across the banner rather than around
     * a ring, so a full turn would swing the outer two off the sides and stack
     * the middle four on top of each other twice per revolution.
     */
    const damp = 1 - Math.exp(-3.2 * delta);
    const time = state.clock.elapsedTime;
    const targetX = state.pointer.y * 0.1 + Math.sin(time * 0.19) * 0.03;
    const targetY = state.pointer.x * 0.16 + Math.sin(time * 0.14) * 0.07;

    group.rotation.x += (targetX - group.rotation.x) * damp;
    group.rotation.y += (targetY - group.rotation.y) * damp;
    group.position.y = Math.sin(time * 0.42) * 0.1;
  });

  return (
    <group ref={rootRef}>
      <SharedCore />
      <Web positions={positions} />
      <DustField count={lowPower ? 60 : 160} spread={spread} />
      {products.map((product, index) => (
        <Cluster
          key={product.id}
          slot={SLOTS[index] ?? LAST_SLOT}
          hex={accentHex[product.accent]}
          index={index}
          spread={spread}
          scale={scale}
          active={hovered === product.id}
        />
      ))}
    </group>
  );
}

/* ── Scene export ────────────────────────────────────────────────────────────
 * No <Canvas> here: the whole site shares one WebGL context (see
 * components/3d/Stage), so this module exports the scene graph and SceneView
 * mounts it through a drei <View>. Camera, lighting and off-screen pausing are
 * handled there.
 * -------------------------------------------------------------------------- */

export interface SolutionsSceneProps {
  /** Product id of the card under the pointer or holding focus, if any. */
  hovered: string | null;
}

export function SolutionsScene({ hovered }: SolutionsSceneProps) {
  const { lowPower } = useWebGL();
  return <Lattice hovered={hovered} lowPower={lowPower} />;
}

export default SolutionsScene;
