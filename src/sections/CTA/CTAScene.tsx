import { useEffect, useMemo, useRef } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, MathUtils } from "three";
import type { Group, Mesh } from "three";
import type { MotionValue } from "framer-motion";
import { C } from "@/components/3d/palette";
import { useWebGL } from "@/hooks";

/* ============================================================================
 * CLOSING SCENE — WebGL
 * ----------------------------------------------------------------------------
 * Lazy-loaded by the CTA section into the site's shared canvas. Nothing here
 * may be imported eagerly — the `three` chunk has to stay out of the initial
 * bundle.
 *
 * This is the last thing a prospective client sees before the contact form, so
 * the brief is readability first: the scene lives in a band *below* the glass
 * slab, never behind it. That is not a stylistic choice — the shared canvas is
 * fixed at z-index 10 and paints above section content, so anything drawn over
 * the heading would directly reduce its contrast.
 *
 * Within that band: a grid floor running to a horizon at the band's mid-line,
 * particles drifting above it, and three large wireframe forms sitting on the
 * horizon. Everything blends additively at low intensity, so the composition
 * lightens the page rather than laying a dark rectangle over it.
 * ========================================================================== */

/* ── Colour ──────────────────────────────────────────────────────────────────
 * The floor grades brand blue in the foreground → cyan → the first of violet at
 * the horizon, which is the design system's gradient language read as depth.
 * -------------------------------------------------------------------------- */

const RAMP = [C.brand, C.cyan, C.violet] as const;

/** Scratch stops — reused so sampling the ramp never allocates. */
const stopA = new Color();
const stopB = new Color();

function gradientAt(u: number, target: Color): Color {
  const t = MathUtils.clamp(u, 0, 1) * (RAMP.length - 1);
  const index = Math.min(Math.floor(t), RAMP.length - 2);
  stopA.set(RAMP[index]);
  stopB.set(RAMP[index + 1]);
  return target.copy(stopA).lerp(stopB, t - index);
}

/* ── Grid floor ──────────────────────────────────────────────────────────────
 * One <lineSegments> for the whole floor — a single draw call for several
 * thousand metres of grid.
 *
 * The band is scissored to a rectangle, so a plain grid would show four hard
 * cut edges. Instead of masking (impossible: the canvas is a separate layer
 * from the page), the fade is baked into the vertex colours — near the camera,
 * towards the horizon and out to the sides. Additive blending turns "black" into
 * "absent", so the floor dissolves into the page on every side.
 * -------------------------------------------------------------------------- */

/** Where the camera sits. The floor's fades are measured from here. */
const CAMERA_Z = 6;
/** Grid squares travelled per second, towards the viewer. */
const FLOOR_SPEED = 1.15;
/** Overall floor brightness. Deliberately low — this is ambience, not a subject. */
const FLOOR_LEVEL = 0.62;

const tint = new Color();

/** Colour of the floor at a point, including all three distance fades. */
function floorTint(x: number, z: number, target: Color): Color {
  const depth = CAMERA_Z - z;
  const near = MathUtils.smoothstep(depth, 1, 6.5);
  const far = 1 - MathUtils.smoothstep(depth, 24, 54);
  const side = 1 - MathUtils.smoothstep(Math.abs(x), 13, 32);
  gradientAt(MathUtils.clamp(depth / 50, 0, 1) * 0.8, target);
  return target.multiplyScalar(near * far * side * FLOOR_LEVEL);
}

/**
 * Builds the floor sheet. It extends a full cell past the camera at the near
 * end so that scrolling it forward by one cell period never exposes an edge.
 */
function buildFloor(cell: number, halfX: number, zNear: number, zFar: number): BufferGeometry {
  const xSteps = Math.round((halfX * 2) / cell);
  const zSteps = Math.round((zNear - zFar) / cell);
  // Longitudinal lines run to the horizon; transverse lines carry the motion.
  // Both are subdivided at the cell size so the fades can be interpolated.
  const segments = (xSteps + 1) * zSteps + (zSteps + 1) * xSteps;

  const positions = new Float32Array(segments * 6);
  const colours = new Float32Array(segments * 6);
  let cursor = 0;

  const push = (x: number, z: number) => {
    positions[cursor] = x;
    positions[cursor + 1] = 0;
    positions[cursor + 2] = z;
    floorTint(x, z, tint);
    colours[cursor] = tint.r;
    colours[cursor + 1] = tint.g;
    colours[cursor + 2] = tint.b;
    cursor += 3;
  };

  for (let i = 0; i <= xSteps; i += 1) {
    const x = -halfX + i * cell;
    for (let j = 0; j < zSteps; j += 1) {
      push(x, zNear - j * cell);
      push(x, zNear - (j + 1) * cell);
    }
  }
  for (let j = 0; j <= zSteps; j += 1) {
    const z = zNear - j * cell;
    for (let i = 0; i < xSteps; i += 1) {
      push(-halfX + i * cell, z);
      push(-halfX + (i + 1) * cell, z);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colours, 3));
  return geometry;
}

/** Grid density and extent. Coarser and shallower on phones. */
const FLOOR_SHEET = {
  full: { cell: 1.6, halfX: 32, zNear: 8, zFar: -56 },
  low: { cell: 2.2, halfX: 26, zNear: 8, zFar: -44 },
} as const;

function GridFloor({ lowPower }: { lowPower: boolean }) {
  const sheet = lowPower ? FLOOR_SHEET.low : FLOOR_SHEET.full;
  const geometry = useMemo(
    () => buildFloor(sheet.cell, sheet.halfX, sheet.zNear, sheet.zFar),
    [sheet],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  const ref = useRef<Group>(null);
  useFrame((state) => {
    // The sheet is periodic in z, so wrapping the offset at one cell makes the
    // floor read as infinite while never moving more than a single square.
    if (ref.current) {
      ref.current.position.z = (state.clock.elapsedTime * FLOOR_SPEED) % sheet.cell;
    }
  });

  return (
    <group ref={ref}>
      <lineSegments geometry={geometry} raycast={() => null}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

/* ── Particle field ──────────────────────────────────────────────────────────
 * Two <points> clouds at different depths — one draw call each — translating on
 * slow, mutually-prime sine periods. Drift rather than travel: a cloud that
 * scrolled forward would have to wrap, and wrapping a non-periodic distribution
 * jumps the whole field at once. The floor supplies the forward motion.
 * -------------------------------------------------------------------------- */

interface CloudSpec {
  count: number;
  spread: [number, number, number];
  centre: [number, number, number];
  size: number;
  colour: string;
  opacity: number;
  /** Drift amplitude and rate for x and y. */
  drift: [number, number, number, number];
}

function Cloud({ count, spread, centre, size, colour, opacity, drift }: CloudSpec) {
  const positions = useMemo(() => {
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = centre[0] + (Math.random() * 2 - 1) * spread[0];
      array[i * 3 + 1] = centre[1] + (Math.random() * 2 - 1) * spread[1];
      array[i * 3 + 2] = centre[2] + (Math.random() * 2 - 1) * spread[2];
    }
    return array;
  }, [count, centre, spread]);

  const ref = useRef<Group>(null);
  useFrame((state) => {
    const group = ref.current;
    if (!group) return;
    const time = state.clock.elapsedTime;
    group.position.x = Math.sin(time * drift[1]) * drift[0];
    group.position.y = Math.sin(time * drift[3]) * drift[2];
  });

  return (
    <group ref={ref}>
      <points raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={size}
          color={colour}
          transparent
          opacity={opacity}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

/* ── Wireframe forms ─────────────────────────────────────────────────────────
 * Large, slow and faint. They sit on the horizon in the mid-distance so they
 * are read as scenery behind the closing message, never as a competing subject.
 * -------------------------------------------------------------------------- */

function WireForm({
  position,
  colour,
  opacity,
  spin,
  children,
}: {
  position: [number, number, number];
  colour: string;
  opacity: number;
  spin: [number, number];
  children: ReactNode;
}) {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.rotation.x += delta * spin[0];
    mesh.rotation.y += delta * spin[1];
  });

  return (
    <mesh ref={ref} position={position} raycast={() => null}>
      {children}
      <meshBasicMaterial
        color={colour}
        wireframe
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

function Scene({ progress, lowPower }: { progress: MotionValue<number>; lowPower: boolean }) {
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;

    const damp = 1 - Math.exp(-2.4 * delta);

    // Scroll-linked drift: the world rises very slightly as the band crosses the
    // viewport, which tips the floor towards the viewer as they reach the end of
    // the page. `.get()` keeps the motion value out of React — turning it into
    // state would re-render the whole CTA on every scroll frame.
    const scroll = (progress.get() - 0.5) * 0.55;

    group.position.x += (-state.pointer.x * 0.35 - group.position.x) * damp;
    group.position.y += (scroll - state.pointer.y * 0.12 - group.position.y) * damp;
    group.rotation.y += (state.pointer.x * 0.012 - group.rotation.y) * damp;
  });

  return (
    <group ref={ref}>
      <GridFloor lowPower={lowPower} />

      <Cloud
        count={lowPower ? 90 : 220}
        centre={[0, 2.8, -9]}
        spread={[14, 2.4, 13]}
        // Sized so a mote lands at ~2px on a desktop band. Point size is in
        // world units under sizeAttenuation, so it has to grow with distance.
        size={0.09}
        colour={C.cyan}
        opacity={0.5}
        drift={[0.6, 0.08, 0.25, 0.13]}
      />
      <Cloud
        count={lowPower ? 110 : 260}
        centre={[0, 4.5, -34]}
        spread={[26, 4, 14]}
        size={0.22}
        colour={C.brand}
        opacity={0.45}
        drift={[0.95, 0.05, 0.4, 0.09]}
      />

      <WireForm
        position={[-7, 3.4, -13]}
        colour={C.brand}
        opacity={0.16}
        spin={[0.028, 0.041]}
      >
        <icosahedronGeometry args={[3, 1]} />
      </WireForm>
      <WireForm position={[7.5, 2.9, -16]} colour={C.cyan} opacity={0.14} spin={[0.034, -0.026]}>
        <torusGeometry args={[2.6, 0.5, 6, 26]} />
      </WireForm>
      <WireForm position={[0.6, 5.4, -20]} colour={C.violet} opacity={0.13} spin={[-0.022, 0.033]}>
        <octahedronGeometry args={[2.2, 0]} />
      </WireForm>
    </group>
  );
}

/* ── Scene export ────────────────────────────────────────────────────────────
 * No <Canvas> here: the whole site shares one WebGL context (see
 * components/3d/Stage), so this module exports scene graph only and SceneView
 * mounts it through a drei <View>. Camera, lighting and off-screen pausing all
 * belong to SceneView.
 * -------------------------------------------------------------------------- */

export function CTAScene({ progress }: { progress: MotionValue<number> }) {
  const { lowPower } = useWebGL();
  return <Scene progress={progress} lowPower={lowPower} />;
}

export default CTAScene;
