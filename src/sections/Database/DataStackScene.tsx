import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Instance, Instances } from "@react-three/drei";
import type { PositionMesh } from "@react-three/drei";
import { AdditiveBlending, Color, DoubleSide, MathUtils } from "three";
import type { Group, MeshStandardMaterial } from "three";
import { databases } from "@/data/technologies";
import type { DatabaseEngine } from "@/data/technologies";
import { products } from "@/data/products";
import { C, accentHex } from "@/components/3d/palette";
import { useWebGL } from "@/hooks";

/* ============================================================================
 * DATA STACK — WebGL scene
 * ----------------------------------------------------------------------------
 * The 3D form of the section's architecture diagram: business applications on
 * top, data services in the middle, storage engines below, with data visibly
 * moving between them. Lazy-loaded, so `three` never reaches the initial
 * bundle, and mounted into the site's single shared canvas by SceneView.
 *
 * `activeDatabase` is the same hover state the detail cards and the SVG diagram
 * already share, so pointing at a card lights its cylinder here too.
 * ========================================================================== */

/** Slab footprint. Every position below is expressed inside this box. */
const SLAB_W = 6;
const SLAB_D = 3.4;
/** Y of each layer. The gap has to be wide enough to read the flow between. */
const APPS_Y = 1.85;
const SERVICES_Y = 0;
const STORAGE_Y = -1.85;

/*
 * Layer titles mirror the SVG diagram this scene replaces. They are labels for
 * the architecture itself rather than marketing copy — the products, services
 * and engines drawn on the slabs all come from the data layer.
 */
const LAYERS = [
  { index: "01", label: "Business Applications", y: APPS_Y },
  { index: "02", label: "Data Services", y: SERVICES_Y },
  { index: "03", label: "Storage", y: STORAGE_Y },
] as const;

/** Six product nodes, two rows deep so the top slab reads in three dimensions. */
const PRODUCT_NODES = products.map((product, index) => ({
  id: product.id,
  colour: accentHex[product.accent],
  position: [-1.75 + (index % 3) * 1.75, APPS_Y + 0.22, index < 3 ? -0.72 : 0.72] as const,
}));

/** Six service chips laid out as a bus across the middle slab. */
const SERVICE_CHIPS = Array.from({ length: 6 }, (_, index) => ({
  colour: index % 2 === 0 ? C.cyan : C.brand,
  position: [-2.35 + index * 0.94, SERVICES_Y + 0.14, 0] as const,
}));

/** Four storage engines, evenly spaced along the bottom slab. */
const STORAGE_NODES = databases.map((database, index) => ({
  database,
  position: [-2.1 + index * 1.4, STORAGE_Y, 0] as const,
}));

/* ── Flow paths ───────────────────────────────────────────────────────────── */

type Point = readonly [number, number, number];

interface FlowPath {
  from: Point;
  to: Point;
  colour: string;
  /** Index into `databases`, or -1 for traffic that never reaches storage. */
  database: number;
}

/**
 * Fixed routes through the stack: applications write down into the services
 * layer, services write down into storage, and results travel back up. Every
 * path that touches an engine carries that engine's own tint, which is what
 * lets a hovered card accelerate exactly the right particles.
 */
const PATHS: FlowPath[] = [
  // Applications → services.
  ...PRODUCT_NODES.map((node, index) => ({
    from: node.position,
    to: SERVICE_CHIPS[index].position,
    colour: C.cyan,
    database: -1,
  })),
  // Services → storage. Each engine is fed by two services.
  ...STORAGE_NODES.flatMap((node, index) =>
    [index, (index + 2) % SERVICE_CHIPS.length].map((chip) => ({
      from: SERVICE_CHIPS[chip].position,
      to: node.position,
      colour: node.database.tint,
      database: index,
    })),
  ),
  // Storage → services: query results coming back.
  ...STORAGE_NODES.map((node, index) => ({
    from: node.position,
    to: SERVICE_CHIPS[(index + 1) % SERVICE_CHIPS.length].position,
    colour: C.emerald,
    database: index,
  })),
  // Services → applications.
  ...[0, 2, 4].map((chip) => ({
    from: SERVICE_CHIPS[chip].position,
    to: PRODUCT_NODES[chip].position,
    colour: C.brand,
    database: -1,
  })),
];

/** Three particles per path, evenly staggered so the flow never pulses. */
const PER_PATH = 3;

interface Particle {
  path: FlowPath;
  offset: number;
  /** Where the particle sits at `offset`, so nothing flashes at the origin on
   *  the frame before the first animation tick. */
  start: [number, number, number];
  speed: number;
  full: Color;
  dim: Color;
}

const PARTICLES: Particle[] = PATHS.flatMap((path, pathIndex) =>
  Array.from({ length: PER_PATH }, (_, index) => {
    const full = new Color(path.colour);
    const offset = index / PER_PATH;
    return {
      path,
      offset,
      start: [
        path.from[0] + (path.to[0] - path.from[0]) * offset,
        path.from[1] + (path.to[1] - path.from[1]) * offset,
        path.from[2] + (path.to[2] - path.from[2]) * offset,
      ],
      // Slight per-path variation so the columns don't march in lockstep.
      speed: 0.24 + ((pathIndex * 7) % 5) * 0.02,
      full,
      dim: full.clone().lerp(new Color(C.surface), 0.72),
    };
  }),
);

/** One buffer holding every path as a faint conduit line. */
const CONDUITS = new Float32Array(
  PATHS.flatMap((path) => [...path.from, ...path.to]),
);

/* ── Slab ────────────────────────────────────────────────────────────────── */

/** Grid lines for one slab, in the XZ plane, including its outer border. */
function slabGrid(columns: number, rows: number): Float32Array {
  const array = new Float32Array((columns + 1 + rows + 1) * 6);
  let offset = 0;

  for (let i = 0; i <= columns; i += 1) {
    const x = -SLAB_W / 2 + (i / columns) * SLAB_W;
    array.set([x, 0, -SLAB_D / 2, x, 0, SLAB_D / 2], offset);
    offset += 6;
  }
  for (let i = 0; i <= rows; i += 1) {
    const z = -SLAB_D / 2 + (i / rows) * SLAB_D;
    array.set([-SLAB_W / 2, 0, z, SLAB_W / 2, 0, z], offset);
    offset += 6;
  }

  return array;
}

function Slab({ y, grid, phase }: { y: number; grid: Float32Array; phase: number }) {
  const ref = useRef<Group>(null);

  useFrame((state) => {
    // A shallow bob per layer, out of phase, so the three planes never look
    // welded into one block.
    if (ref.current) {
      ref.current.position.y = y + Math.sin(state.clock.elapsedTime * 0.5 + phase) * 0.05;
    }
  });

  return (
    <group ref={ref} position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[SLAB_W, SLAB_D]} />
        <meshStandardMaterial
          color={C.surface}
          transparent
          opacity={0.5}
          roughness={0.85}
          metalness={0.15}
          side={DoubleSide}
          // Without this a semi-transparent slab still writes depth and hides
          // the particles travelling behind it — the one thing the scene exists
          // to show. Depth *testing* stays on, so the engines below still
          // occlude correctly.
          depthWrite={false}
        />
      </mesh>
      <lineSegments position={[0, 0.002, 0]} raycast={() => null}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[grid, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          color={C.brand}
          transparent
          opacity={0.28}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>
    </group>
  );
}

/* ── Storage engine ──────────────────────────────────────────────────────── */

/**
 * A cylinder plus two rims — the shape everyone already reads as a database.
 * Highlighting is animated rather than switched, so a hover never snaps.
 */
function StorageEngine({
  database,
  position,
  state,
}: {
  database: DatabaseEngine;
  position: Point;
  /** 1 = highlighted, 0 = resting, -1 = another engine is highlighted. */
  state: number;
}) {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<MeshStandardMaterial>(null);

  const colours = useMemo(() => {
    const full = new Color(database.tint);
    return { full, dim: full.clone().lerp(new Color(C.surface), 0.62) };
  }, [database.tint]);

  useFrame((_, delta) => {
    const damp = 1 - Math.exp(-8 * delta);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(
        MathUtils.lerp(groupRef.current.scale.x, state === 1 ? 1.16 : 1, damp),
      );
    }
    if (bodyRef.current) {
      bodyRef.current.color.lerp(state === -1 ? colours.dim : colours.full, damp);
      bodyRef.current.emissiveIntensity = MathUtils.lerp(
        bodyRef.current.emissiveIntensity,
        state === 1 ? 0.85 : state === -1 ? 0.05 : 0.22,
        damp,
      );
    }
  });

  return (
    <group ref={groupRef} position={[position[0], position[1] + 0.34, position[2]]}>
      <mesh raycast={() => null}>
        <cylinderGeometry args={[0.44, 0.44, 0.62, 22, 1]} />
        <meshStandardMaterial
          ref={bodyRef}
          color={database.tint}
          emissive={database.tint}
          emissiveIntensity={0.22}
          roughness={0.34}
          metalness={0.3}
        />
      </mesh>
      {[0.2, -0.06].map((y) => (
        <mesh key={y} position={[0, y, 0]} raycast={() => null}>
          <cylinderGeometry args={[0.46, 0.46, 0.035, 22, 1]} />
          <meshBasicMaterial
            color={database.tint}
            transparent
            opacity={0.55}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

function Stack({
  activeDatabase,
  lowPower,
}: {
  activeDatabase: string | null;
  lowPower: boolean;
}) {
  const rootRef = useRef<Group>(null);
  const turnRef = useRef<Group>(null);
  const particleRefs = useRef<Array<PositionMesh | null>>([]);
  /** Per-particle progress along its path, advanced rather than recomputed so
   *  a speed change on hover accelerates smoothly instead of jumping. */
  const progress = useMemo(
    () => Float32Array.from(PARTICLES, (particle) => particle.offset),
    [],
  );

  const grid = useMemo(() => slabGrid(lowPower ? 8 : 14, lowPower ? 4 : 8), [lowPower]);

  const activeIndex = databases.findIndex((database) => database.name === activeDatabase);

  useFrame((state, delta) => {
    const damp = 1 - Math.exp(-7 * delta);
    const time = state.clock.elapsedTime;

    // A bounded turntable rather than a full spin: the stack has to stay
    // readable, and the labels are anchored to the back edge of each slab.
    if (turnRef.current) turnRef.current.rotation.y = Math.sin(time * 0.12) * 0.34;

    const root = rootRef.current;
    if (root) {
      const drift = 1 - Math.exp(-3 * delta);
      root.rotation.x += (0.42 + state.pointer.y * 0.14 - root.rotation.x) * drift;
      root.rotation.y += (state.pointer.x * 0.2 - root.rotation.y) * drift;
    }

    for (let i = 0; i < PARTICLES.length; i += 1) {
      const mesh = particleRefs.current[i];
      if (!mesh) continue;

      const particle = PARTICLES[i];
      const isActive = particle.path.database === activeIndex;
      const boost = activeIndex < 0 ? 1 : isActive ? 2.6 : 0.55;

      let t = progress[i] + delta * particle.speed * boost;
      if (t >= 1) t -= Math.floor(t);
      progress[i] = t;

      const { from, to } = particle.path;
      mesh.position.set(
        from[0] + (to[0] - from[0]) * t,
        from[1] + (to[1] - from[1]) * t,
        from[2] + (to[2] - from[2]) * t,
      );
      // Fade in and out at the ends of the run so particles don't pop.
      mesh.scale.setScalar(0.35 + Math.sin(Math.PI * t) * 0.65);
      mesh.color.lerp(
        activeIndex < 0 || isActive || particle.path.database < 0
          ? particle.full
          : particle.dim,
        damp,
      );
    }
  });

  return (
    <group ref={rootRef} rotation={[0.42, 0, 0]}>
      <group ref={turnRef}>
        {LAYERS.map((layer, index) => (
          <Slab key={layer.index} y={layer.y} grid={grid} phase={index * 2.1} />
        ))}

        {/* Conduits — the fixed routes the particles run along. */}
        <lineSegments raycast={() => null}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[CONDUITS, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color={C.brand}
            transparent
            opacity={0.14}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>

        {/* Business applications */}
        {PRODUCT_NODES.map((node) => (
          <mesh key={node.id} position={[node.position[0], node.position[1], node.position[2]]} raycast={() => null}>
            <boxGeometry args={[0.62, 0.2, 0.62]} />
            <meshStandardMaterial
              color={node.colour}
              emissive={node.colour}
              emissiveIntensity={0.24}
              roughness={0.4}
              metalness={0.25}
            />
          </mesh>
        ))}

        {/* Data services */}
        {SERVICE_CHIPS.map((chip) => (
          <mesh
            key={chip.position[0]}
            position={[chip.position[0], chip.position[1], chip.position[2]]}
            raycast={() => null}
          >
            <boxGeometry args={[0.66, 0.12, 0.34]} />
            <meshStandardMaterial
              color={chip.colour}
              emissive={chip.colour}
              emissiveIntensity={0.2}
              roughness={0.45}
              metalness={0.2}
            />
          </mesh>
        ))}

        {/* Storage */}
        {STORAGE_NODES.map((node, index) => (
          <StorageEngine
            key={node.database.name}
            database={node.database}
            position={node.position}
            state={activeIndex < 0 ? 0 : activeIndex === index ? 1 : -1}
          />
        ))}

        {/* Data in flight — every particle in a single instanced draw call. */}
        <Instances limit={PARTICLES.length}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
          {PARTICLES.map((particle, index) => (
            <Instance
              key={index}
              ref={(element: PositionMesh | null) => {
                particleRefs.current[index] = element;
              }}
              color={particle.full}
              position={particle.start}
            />
          ))}
        </Instances>

        {/*
          DOM chips rather than drei's <Text>: troika cannot parse this
          project's variable fonts and leaves the Suspense boundary hanging
          forever. Anchored to the back edge of each slab, where the tilt puts
          them clear of the objects on it.
        */}
        {LAYERS.map((layer) => (
          <Html
            key={layer.index}
            center
            position={[-2, layer.y + 0.18, -SLAB_D / 2]}
            zIndexRange={[10, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span className="ng-glass flex select-none items-center gap-2 whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] sm:text-[0.5625rem] sm:tracking-[0.18em]">
              <span className="text-ng-cyan">{layer.index}</span>
              <span className="text-ng-fg2">{layer.label}</span>
            </span>
          </Html>
        ))}

        {/* Only the highlighted engine is named — four chips would collide on a
            360px screen, and the cards below carry every name in full. */}
        {activeIndex >= 0 && (
          <Html
            center
            position={[
              STORAGE_NODES[activeIndex].position[0],
              STORAGE_Y + 1.05,
              STORAGE_NODES[activeIndex].position[2],
            ]}
            zIndexRange={[10, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span
              className="ng-glass select-none whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-ng-fg sm:text-[0.5625rem] sm:tracking-[0.18em]"
              style={{ color: databases[activeIndex].tint }}
            >
              {databases[activeIndex].name}
            </span>
          </Html>
        )}
      </group>
    </group>
  );
}

/* ── Scene export ────────────────────────────────────────────────────────────
 * Scene graph only. Camera, the shared lighting rig, off-screen pausing and
 * the 2D fallback all belong to SceneView.
 * -------------------------------------------------------------------------- */

export function DataStackScene({ activeDatabase }: { activeDatabase: string | null }) {
  const { lowPower } = useWebGL();
  return <Stack activeDatabase={activeDatabase} lowPower={lowPower} />;
}

export default DataStackScene;
