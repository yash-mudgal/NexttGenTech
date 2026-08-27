import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Instance, Instances } from "@react-three/drei";
import type { PositionMesh } from "@react-three/drei";
import { AdditiveBlending, Color, MathUtils, Quaternion, Shape, Vector3 } from "three";
import type { Group, LineBasicMaterial } from "three";
import { technologies } from "@/data/technologies";
import type { TechCategoryId } from "@/data/technologies";
import { C } from "@/components/3d/palette";
import { useWebGL } from "@/hooks";

/* ============================================================================
 * TECHNOLOGY SPHERE — WebGL scene
 * ----------------------------------------------------------------------------
 * Lazy-loaded by the Technologies section. Nothing here may be imported
 * eagerly: the `three` chunk has to stay out of the initial bundle, and no
 * scene module ever renders its own <Canvas> — SceneView mounts this into the
 * site's single shared context through a drei <View>.
 *
 * The sphere is not decoration. It reads the same active filter as the tab rail
 * below it, so selecting "Backend" lifts and brightens those four tiles and
 * drops everything else to a quarter strength.
 * ========================================================================== */

/** Matches the section's own filter union — "all" plus every category id. */
export type TechSphereFilter = TechCategoryId | "all";

/** Radius the tiles sit on. Camera and label offsets are tuned to this. */
const RADIUS = 2.5;
/** 137.5° — the golden angle. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
/** Extruded tiles face +Z before rotation. */
const FORWARD = new Vector3(0, 0, 1);

interface TechNode {
  name: string;
  category: TechCategoryId;
  /** Unit vector from the centre out through the tile. */
  direction: Vector3;
  position: [number, number, number];
  /** Sits just outside the tile, so a chip never covers its own node. */
  labelPosition: [number, number, number];
  /** Rotation that turns the tile face outward. */
  quaternion: Quaternion;
  /** The technology's own tint, and the dimmed variant used when filtered out. */
  full: Color;
  dim: Color;
}

/*
 * Fibonacci (golden-spiral) placement: walk `y` linearly from the top pole to
 * the bottom one and advance the azimuth by the golden angle at every step.
 * A naive lat/long grid would pack the same 26 tiles into rings that crowd at
 * the poles and leave the equator sparse; this spaces them evenly.
 * The +0.5 offset keeps the first and last tile off the poles exactly.
 */
const NODES: TechNode[] = technologies.map((tech, index) => {
  const y = 1 - ((index + 0.5) / technologies.length) * 2;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = GOLDEN_ANGLE * index;
  const direction = new Vector3(Math.cos(theta) * ring, y, Math.sin(theta) * ring);
  const full = new Color(tech.tint);

  return {
    name: tech.name,
    category: tech.category,
    direction,
    position: [direction.x * RADIUS, direction.y * RADIUS, direction.z * RADIUS],
    labelPosition: [
      direction.x * (RADIUS + 0.62),
      direction.y * (RADIUS + 0.62),
      direction.z * (RADIUS + 0.62),
    ],
    quaternion: new Quaternion().setFromUnitVectors(FORWARD, direction),
    full,
    // Toward the page surface rather than to black, so a dimmed tile still
    // reads as a tile instead of a hole in the sphere.
    dim: full.clone().lerp(new Color(C.surface), 0.78),
  };
});

/**
 * Every tile joined to its two nearest neighbours, deduplicated.
 *
 * ~40 segments in a single buffer, which is what makes the sphere read as one
 * connected stack rather than scattered dots. A fully connected graph would be
 * 325 segments of visual noise.
 */
const MESH_LINES: Float32Array = (() => {
  const seen = new Set<string>();
  const points: number[] = [];

  NODES.forEach((node, i) => {
    const nearest = NODES.map((other, j) => ({
      j,
      distance: node.direction.distanceToSquared(other.direction),
    }))
      .filter((entry) => entry.j !== i)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 2);

    for (const { j } of nearest) {
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      points.push(...NODES[i].position, ...NODES[j].position);
    }
  });

  return new Float32Array(points);
})();

/** Three great circles on tilted planes — structure behind the tiles. */
function greatCircles(segments: number): Float32Array {
  const planes: Array<[Vector3, number]> = [
    [new Vector3(1, 0, 0), 0],
    [new Vector3(1, 0, 0), Math.PI / 2.6],
    [new Vector3(0, 0, 1), Math.PI / 2.6],
  ];
  const array = new Float32Array(planes.length * segments * 6);
  const point = new Vector3();
  let offset = 0;

  for (const [axis, angle] of planes) {
    for (let i = 0; i < segments; i += 1) {
      // One segment = two endpoints, so the whole set is a single lineSegments.
      for (let end = 0; end < 2; end += 1) {
        const t = ((i + end) / segments) * Math.PI * 2;
        point
          .set(Math.cos(t) * RADIUS, 0, Math.sin(t) * RADIUS)
          .applyAxisAngle(axis, angle);
        array[offset] = point.x;
        array[offset + 1] = point.y;
        array[offset + 2] = point.z;
        offset += 3;
      }
    }
  }

  return array;
}

/** Rounded-square profile, centred on the origin, extruded into the tile. */
const TILE_SHAPE = (() => {
  const half = 0.46;
  const radius = 0.15;
  const shape = new Shape();
  shape.moveTo(-half + radius, -half);
  shape.lineTo(half - radius, -half);
  shape.quadraticCurveTo(half, -half, half, -half + radius);
  shape.lineTo(half, half - radius);
  shape.quadraticCurveTo(half, half, half - radius, half);
  shape.lineTo(-half + radius, half);
  shape.quadraticCurveTo(-half, half, -half, half - radius);
  shape.lineTo(-half, -half + radius);
  shape.quadraticCurveTo(-half, -half, -half + radius, -half);
  return shape;
})();

const TILE_EXTRUDE = { depth: 0.08, bevelEnabled: false, curveSegments: 5 };

/* ── Scene ───────────────────────────────────────────────────────────────── */

function Sphere({ active, lowPower }: { active: TechSphereFilter; lowPower: boolean }) {
  const rootRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const tileRefs = useRef<Array<PositionMesh | null>>([]);
  const haloRefs = useRef<Array<PositionMesh | null>>([]);
  const chipRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const meshLineRef = useRef<LineBasicMaterial>(null);

  const circles = useMemo(() => greatCircles(lowPower ? 40 : 72), [lowPower]);
  // Reused every frame — never allocate inside useFrame.
  const scratch = useMemo(() => ({ node: new Vector3(), centre: new Vector3() }), []);

  /* 26 chips at once would be unreadable, so only the selected category is
     labelled; the wall below carries every name in full. */
  const labelled = useMemo(
    () => (active === "all" ? [] : NODES.filter((node) => node.category === active)),
    [active],
  );

  useFrame((state, delta) => {
    const damp = 1 - Math.exp(-7 * delta);
    const filtered = active !== "all";

    // Absolute function of the clock rather than an accumulated delta, so the
    // sphere never drifts out of step after a stall or an off-screen pause.
    const spin = spinRef.current;
    if (spin) spin.rotation.y = state.clock.elapsedTime * 0.075;

    const root = rootRef.current;
    if (root) {
      const drift = 1 - Math.exp(-3 * delta);
      root.rotation.x += (state.pointer.y * 0.2 - root.rotation.x) * drift;
      root.rotation.y += (state.pointer.x * 0.26 - root.rotation.y) * drift;
    }

    for (let i = 0; i < NODES.length; i += 1) {
      const node = NODES[i];
      const on = !filtered || node.category === active;
      const target = on ? node.full : node.dim;

      const tile = tileRefs.current[i];
      if (tile) {
        tile.scale.setScalar(
          MathUtils.lerp(tile.scale.x, filtered ? (on ? 1.2 : 0.68) : 1, damp),
        );
        tile.color.lerp(target, damp);
      }

      const halo = haloRefs.current[i];
      if (halo) {
        halo.scale.setScalar(
          MathUtils.lerp(halo.scale.x, filtered ? (on ? 1.3 : 0.5) : 1, damp),
        );
        halo.color.lerp(target, damp);
      }
    }

    if (meshLineRef.current) {
      meshLineRef.current.opacity = MathUtils.lerp(
        meshLineRef.current.opacity,
        filtered ? 0.09 : 0.2,
        damp,
      );
    }

    /* Depth cue for the chips: compare each node's view-space depth against the
       sphere centre's, which gives −1 at the far pole and +1 at the near one.
       Chips on the back of the sphere fade out rather than colliding with the
       ones in front of them. */
    if (spin && labelled.length > 0) {
      scratch.centre
        .set(0, 0, 0)
        .applyMatrix4(spin.matrixWorld)
        .applyMatrix4(state.camera.matrixWorldInverse);

      for (let i = 0; i < labelled.length; i += 1) {
        const chip = chipRefs.current[i];
        if (!chip) continue;
        scratch.node
          .copy(labelled[i].direction)
          .multiplyScalar(RADIUS)
          .applyMatrix4(spin.matrixWorld)
          .applyMatrix4(state.camera.matrixWorldInverse);
        const facing = (scratch.node.z - scratch.centre.z) / RADIUS;
        chip.style.opacity = String(MathUtils.clamp((facing + 0.1) / 0.5, 0, 1));
      }
    }
  });

  return (
    <group ref={rootRef}>
      {/* Fixed tilt, so the spin axis is never dead vertical. */}
      <group rotation={[0.22, 0, 0.34]}>
        <group ref={spinRef}>
          {/* Neighbour graph */}
          <lineSegments raycast={() => null}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[MESH_LINES, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              ref={meshLineRef}
              color={C.brand}
              transparent
              opacity={0.2}
              depthWrite={false}
              toneMapped={false}
            />
          </lineSegments>

          {/* Great circles */}
          <lineSegments raycast={() => null}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[circles, 3]} />
            </bufferGeometry>
            <lineBasicMaterial
              color={C.cyan}
              transparent
              opacity={0.08}
              depthWrite={false}
              toneMapped={false}
            />
          </lineSegments>

          {/* Glow behind each tile — one draw call for all 26. */}
          <Instances limit={NODES.length} renderOrder={-1}>
            <circleGeometry args={[0.8, 18]} />
            <meshBasicMaterial
              transparent
              opacity={0.16}
              depthWrite={false}
              blending={AdditiveBlending}
              toneMapped={false}
            />
            {NODES.map((node, index) => (
              <Instance
                key={node.name}
                ref={(element: PositionMesh | null) => {
                  haloRefs.current[index] = element;
                }}
                color={node.full}
                // Just inside the tile, so the glow fringes its edges.
                position={[
                  node.direction.x * (RADIUS - 0.04),
                  node.direction.y * (RADIUS - 0.04),
                  node.direction.z * (RADIUS - 0.04),
                ]}
                quaternion={node.quaternion}
              />
            ))}
          </Instances>

          {/* Tiles — instanced, tinted per technology through instanceColor. */}
          <Instances limit={NODES.length}>
            <extrudeGeometry args={[TILE_SHAPE, TILE_EXTRUDE]} />
            <meshStandardMaterial roughness={0.36} metalness={0.22} />
            {NODES.map((node, index) => (
              <Instance
                key={node.name}
                ref={(element: PositionMesh | null) => {
                  tileRefs.current[index] = element;
                }}
                color={node.full}
                position={node.position}
                quaternion={node.quaternion}
              />
            ))}
          </Instances>

          {/*
            DOM chips rather than drei's <Text>: troika parses the font file
            itself and never resolves against this project's variable woff2,
            which leaves the Suspense boundary hanging forever. An <Html> chip
            also renders in the real UI font and matches the 2D fallback.
          */}
          {labelled.map((node, index) => (
            <Html
              key={node.name}
              center
              position={node.labelPosition}
              zIndexRange={[10, 0]}
              style={{ pointerEvents: "none" }}
            >
              <span
                ref={(element) => {
                  chipRefs.current[index] = element;
                }}
                className="ng-glass select-none whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-ng-fg2 sm:text-[0.5625rem] sm:tracking-[0.18em]"
              >
                {node.name}
              </span>
            </Html>
          ))}
        </group>
      </group>

      {/* Core — gives the connection lines somewhere to converge. */}
      <mesh raycast={() => null}>
        <icosahedronGeometry args={[0.62, lowPower ? 0 : 1]} />
        <meshBasicMaterial color={C.brand} wireframe transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh raycast={() => null}>
        <icosahedronGeometry args={[0.44, 0]} />
        <meshBasicMaterial color={C.brandDeep} transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ── Scene export ────────────────────────────────────────────────────────────
 * Scene graph only. Camera, the shared lighting rig, off-screen pausing and
 * the 2D fallback all belong to SceneView.
 * -------------------------------------------------------------------------- */

export function TechSphereScene({ active }: { active: TechSphereFilter }) {
  const { lowPower } = useWebGL();
  return <Sphere active={active} lowPower={lowPower} />;
}

export default TechSphereScene;
