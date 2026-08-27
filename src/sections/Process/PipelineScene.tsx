import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  CatmullRomCurve3,
  Color,
  MathUtils,
  OctahedronGeometry,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import type {
  BufferGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
} from "three";
import type { MotionValue } from "framer-motion";
import { C } from "@/components/3d/palette";
import { company } from "@/config/company";
import { useWebGL } from "@/hooks";

/* ============================================================================
 * DELIVERY PIPELINE — WebGL scene
 * ----------------------------------------------------------------------------
 * Lazy-loaded by the Process section into the site's shared canvas. Nothing in
 * this module may be imported eagerly — the `three` chunk has to stay out of
 * the initial bundle.
 *
 * The section's meaning lives in its <ol>; this is the same seven stages read
 * as one continuous path. Energy enters at Discover and leaves at Evolve, and
 * each waypoint brightens as a pulse crosses it, so the banner says "one
 * pipeline, seven gates" without repeating a word of the copy.
 * ========================================================================== */

const STEP_COUNT = company.process.length;

/* ── Colour ──────────────────────────────────────────────────────────────────
 * The design system's gradient language is blue → cyan → violet, so the path
 * itself carries it: brand at Discover, cyan mid-run, violet at Evolve. Every
 * colour in the scene is sampled from this one ramp, which is what keeps the
 * tube, the pulses and the nodes reading as a single object.
 * -------------------------------------------------------------------------- */

const RAMP = [C.brand, C.cyan, C.violet] as const;

/** Scratch stops — reused so sampling the ramp never allocates. */
const stopA = new Color();
const stopB = new Color();

/** Writes the ramp colour at `u` (0 → 1 along the path) into `target`. */
function gradientAt(u: number, target: Color): Color {
  const t = MathUtils.clamp(u, 0, 1) * (RAMP.length - 1);
  const index = Math.min(Math.floor(t), RAMP.length - 2);
  stopA.set(RAMP[index]);
  stopB.set(RAMP[index + 1]);
  return target.copy(stopA).lerp(stopB, t - index);
}

/* ── Path ────────────────────────────────────────────────────────────────────
 * Control points run left → right and use real depth (z swings ±1.7) rather
 * than staying in a plane — an edge-on ribbon would read as a 2D squiggle at
 * the banner's very wide aspect ratio. The first and last points are lead-in
 * and lead-out: the tube fades to nothing across them, so the pipeline appears
 * to arrive from and continue past the frame instead of ending in a cut stub.
 * -------------------------------------------------------------------------- */

const PATH_POINTS = [
  new Vector3(-5.9, 0.1, 1.6),
  new Vector3(-4.6, -0.55, 1.5),
  new Vector3(-3.1, 0.55, 0.5),
  new Vector3(-1.6, -0.6, -0.5),
  new Vector3(0, 0.3, -1.5),
  new Vector3(1.6, 1.05, -0.5),
  new Vector3(3.1, -0.25, 0.6),
  new Vector3(4.6, 0.65, 1.3),
  new Vector3(5.9, 0.05, 1.7),
];

/** Shared by every part of the scene, so the lookup table is built once. */
const CURVE = new CatmullRomCurve3(PATH_POINTS, false, "catmullrom", 0.5);

/** Waypoints sit inside the faded tails, evenly spaced by arc length. */
const WAYPOINTS = Array.from({ length: STEP_COUNT }, (_, index) => {
  const u = 0.12 + (index / (STEP_COUNT - 1)) * 0.76;
  const colour = gradientAt(u, new Color());
  return {
    index,
    u,
    position: CURVE.getPointAt(u),
    colour: `#${colour.getHexString()}`,
  };
});

/* ── Pulses ──────────────────────────────────────────────────────────────────
 * Deterministic: position is a pure function of the shared clock, so a waypoint
 * can work out how close the nearest pulse is without holding a reference to
 * any pulse component.
 * -------------------------------------------------------------------------- */

const PULSE_OFFSETS = [0, 0.21, 0.42, 0.63, 0.84] as const;
/** Path lengths per second. One full traverse takes ~7s. */
const PULSE_SPEED = 0.14;
/** How close (in path units) a pulse has to be to light a waypoint. */
const PULSE_REACH = 0.075;

/** Pulse position at time `t` for a given stagger offset. */
const pulseU = (time: number, offset: number) => (time * PULSE_SPEED + offset) % 1;

/* ── Framing ─────────────────────────────────────────────────────────────────
 * The banner is a 20rem strip whose aspect ratio runs from about 1.3 on a
 * 360px phone to over 4 on a desktop. A fixed scale would either overflow the
 * narrow case or leave the wide one nearly empty, so the root group is scaled
 * every frame to fit the visible frustum at the path's own depth.
 *
 * The half-extents below already include the perspective magnification of the
 * near half of the path (z reaches +1.7 towards a camera at z = 9) plus the
 * waypoint halos. Re-measure them if the path or the camera moves.
 * -------------------------------------------------------------------------- */

const FIT_HALF_WIDTH = 6.2;
const FIT_HALF_HEIGHT = 1.75;
const FIT_MARGIN = 0.94;

/* ── Tube ────────────────────────────────────────────────────────────────── */

/**
 * A tube along the path, coloured per vertex from the ramp and faded to black
 * at both ends.
 *
 * Every material in this scene blends additively, which is what makes the fade
 * work: black contributes nothing, so the tails vanish into the page instead of
 * painting a dark line across it.
 */
function buildTube(radius: number, tubular: number, radial: number, brightness: number) {
  const geometry = new TubeGeometry(CURVE, tubular, radius, radial, false);
  const colours = new Float32Array((tubular + 1) * (radial + 1) * 3);
  const colour = new Color();

  for (let i = 0; i <= tubular; i += 1) {
    const u = i / tubular;
    const fade =
      MathUtils.smoothstep(u, 0, 0.1) * (1 - MathUtils.smoothstep(u, 0.9, 1)) * brightness;
    gradientAt(u, colour);
    for (let j = 0; j <= radial; j += 1) {
      const offset = (i * (radial + 1) + j) * 3;
      colours[offset] = colour.r * fade;
      colours[offset + 1] = colour.g * fade;
      colours[offset + 2] = colour.b * fade;
    }
  }

  geometry.setAttribute("color", new BufferAttribute(colours, 3));
  return geometry;
}

function PipelinePath({ lowPower }: { lowPower: boolean }) {
  const { core, glow } = useMemo(
    () => ({
      core: buildTube(0.055, lowPower ? 140 : 260, 6, 1),
      glow: buildTube(0.22, lowPower ? 90 : 150, 6, 0.34),
    }),
    [lowPower],
  );

  useEffect(
    () => () => {
      core.dispose();
      glow.dispose();
    },
    [core, glow],
  );

  return (
    <group>
      <mesh geometry={glow} raycast={() => null}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={core} raycast={() => null}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ── Waypoint ────────────────────────────────────────────────────────────────
 * One gate per process step. Its charge comes from two independent sources:
 *
 *   · the section's scroll progress, read straight off the framer-motion value
 *     that already drives the timeline's rail fill. Reading `.get()` inside
 *     useFrame keeps it out of React entirely — turning that motion value into
 *     state would re-render seven cards on every scroll frame;
 *   · the nearest travelling pulse, so the pipeline still reads as live when
 *     the visitor has stopped scrolling.
 * -------------------------------------------------------------------------- */

interface WaypointProps {
  index: number;
  u: number;
  position: Vector3;
  colour: string;
  progress: MotionValue<number>;
  nodeGeometry: BufferGeometry;
  ringGeometry: BufferGeometry;
  haloGeometry: BufferGeometry;
}

/** Floor charge, so an unvisited gate is dim rather than invisible. */
const WAYPOINT_FLOOR = 0.16;

function Waypoint({
  index,
  u,
  position,
  colour,
  progress,
  nodeGeometry,
  ringGeometry,
  haloGeometry,
}: WaypointProps) {
  const nodeRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const ringRef = useRef<Mesh>(null);
  const nodeMaterial = useRef<MeshStandardMaterial>(null);
  const haloMaterial = useRef<MeshBasicMaterial>(null);
  const ringMaterial = useRef<MeshBasicMaterial>(null);
  const charge = useRef(WAYPOINT_FLOOR);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Nearest pulse, measured along the path rather than in space.
    let flash = 0;
    for (const offset of PULSE_OFFSETS) {
      const distance = Math.abs(pulseU(time, offset) - u);
      if (distance < PULSE_REACH) flash = Math.max(flash, 1 - distance / PULSE_REACH);
    }

    const swept = MathUtils.smoothstep(progress.get(), index / STEP_COUNT, (index + 1) / STEP_COUNT);
    const target = WAYPOINT_FLOOR + (1 - WAYPOINT_FLOOR) * Math.min(1, swept * 0.7 + flash * 0.8);

    const damp = 1 - Math.exp(-9 * delta);
    charge.current += (target - charge.current) * damp;
    const lit = charge.current;

    const node = nodeRef.current;
    if (node) {
      node.rotation.y += delta * 0.5;
      node.rotation.x += delta * 0.22;
      node.scale.setScalar(0.85 + lit * 0.45);
    }
    if (nodeMaterial.current) nodeMaterial.current.emissiveIntensity = 0.3 + lit * 1.9;
    if (haloRef.current) haloRef.current.scale.setScalar(0.8 + lit * 0.7);
    if (haloMaterial.current) haloMaterial.current.opacity = 0.05 + lit * 0.22;
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.35 + index;
      ringRef.current.scale.setScalar(1 + lit * 0.25);
    }
    if (ringMaterial.current) ringMaterial.current.opacity = 0.12 + lit * 0.6;
  });

  return (
    <group position={position}>
      <mesh ref={nodeRef} geometry={nodeGeometry} raycast={() => null}>
        <meshStandardMaterial
          ref={nodeMaterial}
          color={colour}
          emissive={colour}
          emissiveIntensity={0.35}
          roughness={0.32}
          metalness={0.15}
          toneMapped={false}
        />
      </mesh>

      {/* Gate ring — lies in the XY plane so it stays broadly camera-facing. */}
      <mesh ref={ringRef} geometry={ringGeometry} raycast={() => null}>
        <meshBasicMaterial
          ref={ringMaterial}
          color={colour}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={haloRef} geometry={haloGeometry} raycast={() => null}>
        <meshBasicMaterial
          ref={haloMaterial}
          color={colour}
          transparent
          opacity={0.05}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ── Pulse ───────────────────────────────────────────────────────────────── */

function Pulse({ offset, geometry }: { offset: number; geometry: BufferGeometry }) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshBasicMaterial>(null);
  // Reused every frame — never allocate inside useFrame.
  const point = useMemo(() => new Vector3(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const u = pulseU(state.clock.elapsedTime, offset);
    mesh.position.copy(CURVE.getPointAt(u, point));

    // Fade in and out at the tails so a pulse never pops into existence.
    const presence = Math.sin(u * Math.PI);
    mesh.scale.setScalar(0.5 + presence * 0.85);
    if (materialRef.current) {
      gradientAt(u, materialRef.current.color);
      materialRef.current.opacity = 0.25 + presence * 0.7;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} raycast={() => null}>
      <meshBasicMaterial
        ref={materialRef}
        color={C.cyan}
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ── Ambient motes ───────────────────────────────────────────────────────────
 * A <points> cloud rather than meshes: one draw call for the whole field.
 * -------------------------------------------------------------------------- */

function Motes({ lowPower }: { lowPower: boolean }) {
  const positions = useMemo(() => {
    const count = lowPower ? 90 : 220;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (Math.random() * 2 - 1) * 6.2;
      array[i * 3 + 1] = (Math.random() * 2 - 1) * 1.9;
      array[i * 3 + 2] = (Math.random() * 2 - 1) * 2.6;
    }
    return array;
  }, [lowPower]);

  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.12;
  });

  return (
    <group ref={ref}>
      <points raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.028}
          color={C.line}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

function Scene({ progress, lowPower }: { progress: MotionValue<number>; lowPower: boolean }) {
  const ref = useRef<Group>(null);

  // One geometry per shape, shared by all seven waypoints and all five pulses:
  // 3 buffers instead of 26.
  const shapes = useMemo(
    () => ({
      node: new OctahedronGeometry(0.19, 0),
      ring: new TorusGeometry(0.32, 0.013, 6, 28),
      halo: new SphereGeometry(0.38, 12, 12),
      pulse: new SphereGeometry(0.07, 10, 10),
    }),
    [],
  );

  useEffect(
    () => () => {
      shapes.node.dispose();
      shapes.ring.dispose();
      shapes.halo.dispose();
      shapes.pulse.dispose();
    },
    [shapes],
  );

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;

    const time = state.clock.elapsedTime;
    const damp = 1 - Math.exp(-3.2 * delta);

    // Bounded drift plus damped pointer parallax. Rotation stays small so the
    // path never swings edge-on, which would collapse it into a vertical smear.
    const targetX = state.pointer.y * 0.12 + Math.sin(time * 0.19) * 0.045;
    const targetY = state.pointer.x * 0.18 + Math.sin(time * 0.13) * 0.075;
    group.rotation.x += (targetX - group.rotation.x) * damp;
    group.rotation.y += (targetY - group.rotation.y) * damp;

    // Fit the pipeline to whatever aspect ratio the banner currently has —
    // see the framing note above.
    const camera = state.camera as PerspectiveCamera;
    const halfHeight = Math.tan(MathUtils.degToRad(camera.fov) * 0.5) * camera.position.z;
    const halfWidth = halfHeight * camera.aspect;
    const fit = MathUtils.clamp(
      Math.min(halfWidth / FIT_HALF_WIDTH, halfHeight / FIT_HALF_HEIGHT) * FIT_MARGIN,
      0.35,
      1.25,
    );
    group.scale.setScalar(group.scale.x + (fit - group.scale.x) * damp);
  });

  return (
    <group ref={ref}>
      <PipelinePath lowPower={lowPower} />
      <Motes lowPower={lowPower} />

      {WAYPOINTS.map((waypoint) => (
        <Waypoint
          key={waypoint.index}
          {...waypoint}
          progress={progress}
          nodeGeometry={shapes.node}
          ringGeometry={shapes.ring}
          haloGeometry={shapes.halo}
        />
      ))}

      {PULSE_OFFSETS.map((offset) => (
        <Pulse key={offset} offset={offset} geometry={shapes.pulse} />
      ))}
    </group>
  );
}

/* ── Scene export ────────────────────────────────────────────────────────────
 * No <Canvas> here: the whole site shares one WebGL context (see
 * components/3d/Stage), so this module exports scene graph only and SceneView
 * mounts it through a drei <View>. Camera, lighting and off-screen pausing all
 * belong to SceneView.
 * -------------------------------------------------------------------------- */

export function PipelineScene({ progress }: { progress: MotionValue<number> }) {
  const { lowPower } = useWebGL();
  return <Scene progress={progress} lowPower={lowPower} />;
}

export default PipelineScene;
