import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { AdditiveBlending, BackSide, MathUtils, QuadraticBezierCurve3, Vector3 } from "three";
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { C } from "@/components/3d/palette";
import { useWebGL } from "@/hooks";
import { cn } from "@/lib/cn";

/* ============================================================================
 * CONNECTED PLATFORM ECOSYSTEM — WebGL scene
 * ----------------------------------------------------------------------------
 * Lazy-loaded by ErpEcosystem. Nothing here may be imported eagerly: the
 * `three` chunk has to stay out of the initial bundle.
 *
 * The scene is decorative. Selection lives entirely in the section's <button>
 * tablist and arrives here as `activeId` — the graph mirrors that state, it
 * never owns it. That keeps the whole section keyboard-operable on devices
 * that never get a canvas at all.
 * ========================================================================== */

export interface EcosystemSceneNode {
  id: string;
  label: string;
  /** Raw accent hex, taken from the node's accent theme by the section. */
  hex: string;
  /** True for the six platforms; the three shared layers sit outside the mesh. */
  product: boolean;
}

export interface EcosystemSceneProps {
  nodes: EcosystemSceneNode[];
  /** Hovered, focused or pinned system — or `null` when the core is showing. */
  activeId: string | null;
  /** Company mark shown on the core. */
  coreLabel: string;
  /** Second line under the mark, e.g. "Business Core". */
  coreKind: string;
  /** Phone layout: the graph runs without labels, because nine chips cannot
   *  fit inside a 19rem box. The accordion beside it names every system. */
  compact: boolean;
}

/* ── Layout ──────────────────────────────────────────────────────────────────
 * Nine systems on a sphere rather than a ring, so the graph reads as a volume
 * from every angle of the slow orbit. Positions come from the Fibonacci
 * spiral: it is the cheapest distribution that keeps neighbours roughly
 * equidistant, which is what stops the labels clustering.
 *
 * Containment, at camera z = 10 / fov 45 (half-extent 4.14 world units at the
 * origin plane): a node at the sphere's near pole projects to 2.15 × 10/7.85 =
 * 2.74, and the widest chip ("Inventory Management") reaches ~1.05 units from
 * its anchor. Worst case 3.79 — inside the frame at every point of the orbit.
 * Raising SPHERE_RADIUS or the chip font size breaks that; re-check if you do.
 * -------------------------------------------------------------------------- */

const SPHERE_RADIUS = 2.15;
/** How far above its node a label chip floats. */
const LABEL_LIFT = 0.46;
/** How far a connection curve bows away from the straight core → node line. */
const CURVE_BOW = 0.52;

/** Reused while building the layout — module scope, so it costs one allocation. */
const UP = new Vector3(0, 1, 0);

interface NodeLayout {
  position: Vector3;
  curve: QuadraticBezierCurve3;
  /** Points along the curve, for the drei <Line>. */
  points: Vector3[];
}

function buildLayout(count: number): NodeLayout[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const origin = new Vector3(0, 0, 0);
  const perpendicular = new Vector3();

  return Array.from({ length: count }, (_, index) => {
    const y = count > 1 ? 1 - (index / (count - 1)) * 2 : 0;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * index;
    const position = new Vector3(
      Math.cos(theta) * ring * SPHERE_RADIUS,
      y * SPHERE_RADIUS,
      Math.sin(theta) * ring * SPHERE_RADIUS,
    );

    // Bow each spoke around the axis perpendicular to it, alternating sides so
    // the fan reads as a web rather than a set of straight radii. The two poles
    // are parallel to UP and have no perpendicular, so they take a fixed one.
    perpendicular.crossVectors(position, UP);
    if (perpendicular.lengthSq() < 1e-4) perpendicular.set(1, 0, 0);
    const control = position
      .clone()
      .multiplyScalar(0.5)
      .addScaledVector(perpendicular.normalize(), index % 2 === 0 ? CURVE_BOW : -CURVE_BOW);

    const curve = new QuadraticBezierCurve3(origin.clone(), control, position.clone());
    return { position, curve, points: curve.getPoints(26) };
  });
}

/* ── One system ──────────────────────────────────────────────────────────── */

/** Six solids, so nine systems read as distinct objects rather than clones. */
function NodeSolid({ shape }: { shape: number }) {
  switch (shape) {
    case 0:
      return <octahedronGeometry args={[0.28, 0]} />;
    case 1:
      return <icosahedronGeometry args={[0.25, 0]} />;
    case 2:
      return <dodecahedronGeometry args={[0.24, 0]} />;
    case 3:
      return <boxGeometry args={[0.34, 0.34, 0.34]} />;
    case 4:
      return <tetrahedronGeometry args={[0.32, 0]} />;
    default:
      return <coneGeometry args={[0.26, 0.46, 6]} />;
  }
}

interface SystemNodeProps {
  node: EcosystemSceneNode;
  layout: NodeLayout;
  index: number;
  active: boolean;
  dimmed: boolean;
  compact: boolean;
}

function SystemNode({ node, layout, index, active, dimmed, compact }: SystemNodeProps) {
  const solidRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const pulseRef = useRef<Mesh>(null);
  const solidMaterialRef = useRef<MeshStandardMaterial>(null);
  const haloMaterialRef = useRef<MeshBasicMaterial>(null);
  const chipRef = useRef<HTMLSpanElement>(null);

  // One scratch vector per node, filled by the curve every frame. Allocating
  // inside useFrame would churn the heap across every scene on the page.
  const travel = useMemo(() => new Vector3(), []);

  const showChip = !compact;

  useFrame((state, delta) => {
    const damp = 1 - Math.exp(-8 * delta);

    // A packet of light running core → system, staggered so the nine spokes
    // never fire in unison.
    const pulse = pulseRef.current;
    if (pulse) {
      const t = (state.clock.elapsedTime * 0.28 + index * 0.117) % 1;
      layout.curve.getPointAt(t, travel);
      pulse.position.copy(travel);
      pulse.scale.setScalar(0.5 + Math.sin(t * Math.PI) * 0.85);
    }

    const solid = solidRef.current;
    if (solid) {
      solid.rotation.y += delta * 0.5;
      solid.rotation.x += delta * 0.22;
      solid.scale.setScalar(MathUtils.lerp(solid.scale.x, active ? 1.55 : 1, damp));

      // Depth cue: chips on the far side of the sphere recede. View-space z runs
      // 7.85 (nearest) to 12.15 (furthest) for this camera and radius.
      const chip = chipRef.current;
      if (chip) {
        solid.getWorldPosition(travel).applyMatrix4(state.camera.matrixWorldInverse);
        const far = MathUtils.clamp((-travel.z - 8.2) / 3.6, 0, 1);
        const depth = MathUtils.lerp(1, 0.4, far);
        chip.style.opacity = String(active ? 1 : dimmed ? depth * 0.35 : depth);
      }
    }

    if (haloRef.current) {
      haloRef.current.scale.setScalar(
        MathUtils.lerp(haloRef.current.scale.x, active ? 1.5 : 1, damp),
      );
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = MathUtils.lerp(
        haloMaterialRef.current.opacity,
        active ? 0.28 : dimmed ? 0.04 : 0.13,
        damp,
      );
    }
    if (solidMaterialRef.current) {
      const material = solidMaterialRef.current;
      material.opacity = MathUtils.lerp(material.opacity, dimmed ? 0.3 : 1, damp);
      material.emissiveIntensity = MathUtils.lerp(
        material.emissiveIntensity,
        active ? 1.1 : dimmed ? 0.12 : 0.45,
        damp,
      );
    }
  });

  return (
    <group>
      {/* Core → system connector. Width and opacity are declarative: selection
          changes come from the DOM at human speed, not from the render loop. */}
      <Line
        points={layout.points}
        color={node.hex}
        lineWidth={active ? 2.6 : 1.2}
        transparent
        opacity={active ? 0.9 : dimmed ? 0.14 : 0.4}
        depthWrite={false}
        toneMapped={false}
      />

      {/* Travelling pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial
          color={node.hex}
          transparent
          opacity={dimmed ? 0.25 : 0.9}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <group position={layout.position}>
        <mesh ref={solidRef}>
          <NodeSolid shape={index % 6} />
          <meshStandardMaterial
            ref={solidMaterialRef}
            color={node.hex}
            emissive={node.hex}
            emissiveIntensity={0.45}
            roughness={0.32}
            metalness={0.25}
            transparent
            toneMapped={false}
          />
        </mesh>

        {/* Halo — a soft additive shell, so an active system reads as lit. */}
        <mesh ref={haloRef}>
          <sphereGeometry args={[0.42, 14, 14]} />
          <meshBasicMaterial
            ref={haloMaterialRef}
            color={node.hex}
            transparent
            opacity={0.13}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/*
          DOM label rather than drei's <Text>: troika parses the font file
          itself and never resolves against this project's variable woff2,
          which leaves the Suspense boundary hanging forever. An <Html> chip
          also renders in the real UI font and matches the 2D fallback exactly.
        */}
        {showChip && (
          <Html
            center
            position={[0, LABEL_LIFT, 0]}
            zIndexRange={[10, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span
              ref={chipRef}
              className={cn(
                "flex select-none items-center gap-1.5 whitespace-nowrap rounded-full border",
                "px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] backdrop-blur-sm",
                "transition-colors duration-300 sm:text-[0.5625rem]",
                active
                  ? "border-ng-line2 bg-ng-surface2/85 text-ng-fg"
                  : "border-ng-line bg-ng-surface/75 text-ng-fg2",
              )}
            >
              <span
                className="size-1 shrink-0 rounded-full"
                style={{ backgroundColor: node.hex }}
              />
              {node.label}
            </span>
          </Html>
        )}
      </group>
    </group>
  );
}

/* ── Shared core ─────────────────────────────────────────────────────────── */

function Core({
  label,
  kind,
  active,
  dimmed,
  lowPower,
}: {
  label: string;
  kind: string;
  active: boolean;
  dimmed: boolean;
  lowPower: boolean;
}) {
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;
    group.rotation.y -= delta * 0.18;
    group.rotation.x += delta * 0.05;
    const breathe = 1 + Math.sin(state.clock.elapsedTime * 0.85) * 0.04;
    group.scale.setScalar(
      MathUtils.lerp(group.scale.x, breathe * (active ? 1.12 : 1), 1 - Math.exp(-6 * delta)),
    );
  });

  return (
    <group>
      <group ref={ref}>
        {/* Wireframe skeleton */}
        <mesh>
          <icosahedronGeometry args={[0.82, lowPower ? 0 : 1]} />
          <meshBasicMaterial
            color={C.brand}
            wireframe
            transparent
            opacity={dimmed ? 0.24 : 0.55}
            toneMapped={false}
          />
        </mesh>

        {/* Glass shell, lit from the inside */}
        <mesh>
          <icosahedronGeometry args={[1, lowPower ? 0 : 1]} />
          <meshBasicMaterial
            color={C.cyan}
            transparent
            opacity={dimmed ? 0.04 : 0.1}
            side={BackSide}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>

        {/* Dense seed at the centre */}
        <mesh>
          <icosahedronGeometry args={[0.4, 0]} />
          <meshStandardMaterial
            color={C.brandDeep}
            emissive={C.brand}
            emissiveIntensity={active ? 0.7 : 0.35}
            roughness={0.3}
            metalness={0.4}
            transparent
            opacity={dimmed ? 0.45 : 1}
            toneMapped={false}
          />
        </mesh>
      </group>

      <Html center position={[0, -1.32, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span
          className={cn(
            "ng-glass flex select-none flex-col items-center gap-0.5 whitespace-nowrap rounded-full px-3 py-1.5",
            "transition-[box-shadow] duration-[420ms] ease-ng",
            active && "shadow-ng-glow-cyan",
          )}
        >
          <span className="font-display text-[0.625rem] font-semibold tracking-[0.22em] text-ng-fg">
            {label}
          </span>
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ng-cyan">
            {kind}
          </span>
        </span>
      </Html>
    </group>
  );
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

export function EcosystemScene({
  nodes,
  activeId,
  coreLabel,
  coreKind,
  compact,
}: EcosystemSceneProps) {
  const { lowPower } = useWebGL();
  const tiltRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);

  const layout = useMemo(() => buildLayout(nodes.length), [nodes.length]);

  /* Chords between the platforms that ended up nearest one another on the
   * sphere, so the graph reads as a mesh rather than a wheel of spokes. One
   * <Line segments> draws all of them in a single call. */
  const chordPoints = useMemo(() => {
    const platforms = nodes.reduce<number[]>((list, node, index) => {
      if (node.product) list.push(index);
      return list;
    }, []);
    const seen = new Set<string>();
    const points: Vector3[] = [];

    platforms.forEach((from) => {
      const origin = layout[from].position;
      platforms
        .filter((other) => other !== from)
        .sort(
          (a, b) =>
            origin.distanceToSquared(layout[a].position) -
            origin.distanceToSquared(layout[b].position),
        )
        .slice(0, 2)
        .forEach((to) => {
          const key = from < to ? `${from}-${to}` : `${to}-${from}`;
          if (seen.has(key)) return;
          seen.add(key);
          points.push(origin, layout[to].position);
        });
    });

    return points;
  }, [layout, nodes]);

  useFrame((state, delta) => {
    const damp = 1 - Math.exp(-3.2 * delta);

    // Pointer parallax on the outer group, orbital rotation on the inner one,
    // so the two never fight over the same euler.
    const tilt = tiltRef.current;
    if (tilt) {
      const targetX = state.pointer.y * 0.2;
      const targetY = state.pointer.x * 0.26;
      tilt.rotation.x += (targetX - tilt.rotation.x) * damp;
      tilt.rotation.y += (targetY - tilt.rotation.y) * damp;
    }

    const spin = spinRef.current;
    if (spin) {
      spin.rotation.y = state.clock.elapsedTime * 0.075;
      spin.rotation.z = Math.sin(state.clock.elapsedTime * 0.13) * 0.06;
    }
  });

  const coreActive = activeId === null || activeId === "core";

  return (
    <group ref={tiltRef}>
      <group ref={spinRef}>
        <Core
          label={coreLabel}
          kind={coreKind}
          active={coreActive}
          dimmed={!coreActive}
          lowPower={lowPower}
        />

        {chordPoints.length >= 2 && (
          <Line
            segments
            points={chordPoints}
            color={C.line}
            lineWidth={1}
            transparent
            opacity={activeId ? 0.18 : 0.4}
            depthWrite={false}
            toneMapped={false}
          />
        )}

        {nodes.map((node, index) => (
          <SystemNode
            key={node.id}
            node={node}
            layout={layout[index]}
            index={index}
            active={activeId === node.id}
            dimmed={activeId !== null && activeId !== node.id}
            compact={compact}
          />
        ))}
      </group>
    </group>
  );
}

export default EcosystemScene;
