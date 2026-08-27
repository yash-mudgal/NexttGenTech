import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Instance, Instances } from "@react-three/drei";
import { AdditiveBlending, Color, DoubleSide, MathUtils } from "three";
import type {
  Group,
  LineBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointsMaterial,
} from "three";
import { useWebGL } from "@/hooks";
import { C, accentHex } from "@/components/3d/palette";
import type { AccentKey } from "@/components/3d/palette";

/* ============================================================================
 * PRODUCTS — DASHBOARD CONSTELLATION
 * ----------------------------------------------------------------------------
 * Lazy-loaded by the Products section. Nothing here may be imported eagerly:
 * the `three` chunk has to stay out of the initial bundle.
 *
 * Four thin, translucent panels hang at different depths above a grid floor,
 * each carrying abstract application geometry — a title rail, KPI tiles, a bar
 * chart and a trend line with markers. No text: the hand-built HTML dashboard
 * below the banner delivers the detail, this only has to say "these are real
 * systems". The whole composition re-tints toward the slider's active product.
 * ========================================================================== */

/** Deterministic 0–1 sequence. The panels are a composition, not noise: they
 *  must look identical on every mount, so nothing here uses Math.random. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/* ── Panel composition ───────────────────────────────────────────────────────
 * Panels are authored in world units, but their horizontal placement is a
 * fraction of the visible half-width (`xf`). The banner is ~3.5:1 on a desktop
 * and closer to 1.3:1 on a phone, so a fixed x would either strand the
 * composition in the middle of a very wide band or push it off a narrow one.
 * -------------------------------------------------------------------------- */

/** Inner margin of a panel, in panel-local units. */
const PAD = 0.16;
/** Content floats just clear of the panel face so it never z-fights. */
const CONTENT_Z = 0.04;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PanelSpec {
  /** Horizontal placement, as a fraction of the scene's usable half-width. */
  xf: number;
  y: number;
  z: number;
  w: number;
  h: number;
  /** Resting rotation; the drift oscillates around it. */
  tilt: [number, number, number];
  /** Drift offset, so no two panels bob together. */
  phase: number;
  barCount: number;
  /** Vertices on the trend line — also the marker count. */
  trendCount: number;
}

const SPECS: PanelSpec[] = [
  // Hero panel: large, set back, barely turned — the one that reads first.
  { xf: -0.05, y: 0.34, z: -1.6, w: 4.4, h: 2.7, tilt: [0.04, 0.26, -0.02], phase: 0, barCount: 9, trendCount: 12 },
  { xf: -0.84, y: -0.55, z: 0.8, w: 2.5, h: 1.7, tilt: [-0.05, 0.5, 0.04], phase: 1.7, barCount: 7, trendCount: 8 },
  { xf: 0.8, y: 0.68, z: 0.2, w: 2.8, h: 1.85, tilt: [0.06, -0.46, -0.05], phase: 3.1, barCount: 8, trendCount: 9 },
  { xf: 0.46, y: -1.08, z: 1.7, w: 1.9, h: 1.25, tilt: [-0.03, -0.3, 0.06], phase: 4.6, barCount: 6, trendCount: 6 },
];

interface Panel extends PanelSpec {
  /** Title rail + KPI tiles — the neutral application chrome. */
  chrome: Rect[];
  /** Accent bar chart, lower-left. */
  bars: Rect[];
  /** Trend polyline, right-hand column, as line segments. */
  trend: Float32Array;
  /** Markers sitting on the trend vertices. */
  marks: Float32Array;
  /** Panel outline, as line segments. */
  edges: Float32Array;
}

function buildPanel(spec: PanelSpec, index: number): Panel {
  const random = seeded(index * 7919 + 13);
  const { w, h } = spec;
  const innerW = w - PAD * 2;
  const left = -w / 2 + PAD;
  const top = h / 2 - PAD;

  /* Chrome: one title rail, then a row of three KPI tiles. */
  const railH = 0.07;
  const tileH = h * 0.17;
  const tileGap = innerW * 0.04;
  const tileW = (innerW - tileGap * 2) / 3;
  const chrome: Rect[] = [
    { x: left + innerW * 0.28, y: top - railH / 2, w: innerW * 0.56, h: railH },
  ];
  for (let i = 0; i < 3; i += 1) {
    chrome.push({
      x: left + tileW / 2 + i * (tileW + tileGap),
      y: top - railH - 0.09 - tileH / 2,
      w: tileW,
      h: tileH,
    });
  }

  /* Bar chart across the left 60% of the remaining space. */
  const chartTop = top - railH - 0.09 - tileH - 0.12;
  const baseY = -h / 2 + PAD;
  const chartH = chartTop - baseY;
  const chartW = innerW * 0.6;
  const step = chartW / spec.barCount;
  const bars: Rect[] = [];
  for (let i = 0; i < spec.barCount; i += 1) {
    const value = 0.28 + random() * 0.72;
    bars.push({
      x: left + step * (i + 0.5),
      y: baseY + (chartH * value) / 2,
      w: step * 0.52,
      h: chartH * value,
    });
  }

  /* Trend line + markers in the right-hand column. */
  const paneX = left + chartW + innerW * 0.05;
  const paneW = innerW - chartW - innerW * 0.05;
  const trend = new Float32Array((spec.trendCount - 1) * 6);
  const marks = new Float32Array(spec.trendCount * 3);
  const trendStep = paneW / (spec.trendCount - 1);
  let previousX = 0;
  let previousY = 0;
  for (let i = 0; i < spec.trendCount; i += 1) {
    const x = paneX + trendStep * i;
    const y = baseY + chartH * (0.14 + random() * 0.78);
    marks.set([x, y, CONTENT_Z], i * 3);
    if (i > 0) trend.set([previousX, previousY, 0, x, y, 0], (i - 1) * 6);
    previousX = x;
    previousY = y;
  }

  /* Outline: four segments around the panel face. */
  const hw = w / 2;
  const hh = h / 2;
  const edges = new Float32Array([
    -hw, -hh, 0, hw, -hh, 0,
    hw, -hh, 0, hw, hh, 0,
    hw, hh, 0, -hw, hh, 0,
    -hw, hh, 0, -hw, -hh, 0,
  ]);

  return { ...spec, chrome, bars, trend, marks, edges };
}

const PANELS: Panel[] = SPECS.map(buildPanel);

/* ── Visible width ───────────────────────────────────────────────────────── */

/**
 * Half the world-space width visible at z = 0, read from the live camera and
 * the tracked box's own size rather than hardcoded — the banner's aspect ratio
 * changes by nearly 3× between a phone and a desktop.
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

/* ── Panel ───────────────────────────────────────────────────────────────── */

interface PanelProps {
  panel: Panel;
  /** Target colour for the active product. Lerped toward, never assigned. */
  tint: Color;
  /** World units the `xf` fraction is multiplied by. */
  spread: number;
  scale: number;
}

function DashboardPanel({ panel, tint, spread, scale }: PanelProps) {
  const groupRef = useRef<Group>(null);
  const faceRef = useRef<MeshStandardMaterial>(null);
  const edgeRef = useRef<LineBasicMaterial>(null);
  const barRef = useRef<MeshStandardMaterial>(null);
  const trendRef = useRef<LineBasicMaterial>(null);
  const markRef = useRef<PointsMaterial>(null);

  /*
   * The accent is seeded once and animated from then on — it is deliberately
   * never passed as a `color` prop. A prop would be re-applied on every
   * re-render, so changing product would snap the whole scene back to the
   * material's initial colour and kill the transition.
   */
  useLayoutEffect(() => {
    faceRef.current?.color.copy(tint);
    faceRef.current?.emissive.copy(tint);
    edgeRef.current?.color.copy(tint);
    barRef.current?.color.copy(tint);
    barRef.current?.emissive.copy(tint);
    trendRef.current?.color.copy(tint);
    markRef.current?.color.copy(tint);
    // Mount only: `tint` is an initial value here, not a dependency.
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const group = groupRef.current;
    if (group) {
      group.position.x = panel.xf * spread;
      group.position.y = panel.y + Math.sin(time * 0.34 + panel.phase) * 0.14;
      group.position.z = panel.z + Math.sin(time * 0.21 + panel.phase) * 0.1;
      group.rotation.y = panel.tilt[1] + Math.sin(time * 0.17 + panel.phase) * 0.045;
      group.rotation.z = panel.tilt[2] + Math.sin(time * 0.13 + panel.phase) * 0.018;
    }

    // Ease toward the active product so moving the slider reads as one
    // continuous system changing state rather than four panels being swapped.
    const damp = 1 - Math.exp(-3.6 * delta);
    faceRef.current?.color.lerp(tint, damp);
    faceRef.current?.emissive.lerp(tint, damp);
    edgeRef.current?.color.lerp(tint, damp);
    barRef.current?.color.lerp(tint, damp);
    barRef.current?.emissive.lerp(tint, damp);
    trendRef.current?.color.lerp(tint, damp);
    markRef.current?.color.lerp(tint, damp);
  });

  return (
    <group ref={groupRef} rotation-x={panel.tilt[0]} scale={scale}>
      {/* Glass face */}
      <mesh>
        <planeGeometry args={[panel.w, panel.h]} />
        <meshStandardMaterial
          ref={faceRef}
          emissiveIntensity={0.35}
          transparent
          opacity={0.15}
          roughness={0.3}
          metalness={0.45}
          side={DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Outline */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[panel.edges, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={edgeRef}
          transparent
          opacity={0.5}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {/* Application chrome — title rail and KPI tiles, deliberately neutral so
          the accent reads only on the data. */}
      <Instances limit={panel.chrome.length}>
        <boxGeometry args={[1, 1, 0.04]} />
        <meshStandardMaterial color={C.line} roughness={0.75} metalness={0.15} />
        {panel.chrome.map((rect, i) => (
          <Instance
            key={i}
            position={[rect.x, rect.y, CONTENT_Z]}
            scale={[rect.w, rect.h, 1]}
          />
        ))}
      </Instances>

      {/* Bar chart */}
      <Instances limit={panel.bars.length}>
        <boxGeometry args={[1, 1, 0.05]} />
        <meshStandardMaterial ref={barRef} emissiveIntensity={0.55} roughness={0.35} metalness={0.2} />
        {panel.bars.map((rect, i) => (
          <Instance
            key={i}
            position={[rect.x, rect.y, CONTENT_Z]}
            scale={[rect.w, rect.h, 1]}
          />
        ))}
      </Instances>

      {/* Trend line */}
      <lineSegments position={[0, 0, CONTENT_Z]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[panel.trend, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={trendRef}
          transparent
          opacity={0.75}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {/* Trend markers */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[panel.marks, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={markRef}
          size={0.055}
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

/* ── Grid floor ──────────────────────────────────────────────────────────── */

/**
 * Blueprint floor under the panels — the 3D echo of the section's own
 * `GridBackdrop`. Vertex colours fade the lines into the page background so
 * the grid dissolves at its edges instead of ending on a hard cut.
 */
function GridFloor({ halfWidth }: { halfWidth: number }) {
  const [positions, colours] = useMemo(() => {
    const halfX = Math.min(halfWidth * 1.1, 9);
    const near = 2.4;
    const far = -7;
    const columns = 20;
    const rows = 10;

    const vertices: number[] = [];
    for (let i = 0; i <= columns; i += 1) {
      const x = -halfX + (i / columns) * halfX * 2;
      vertices.push(x, 0, near, x, 0, far);
    }
    for (let i = 0; i <= rows; i += 1) {
      const z = near + (i / rows) * (far - near);
      vertices.push(-halfX, 0, z, halfX, 0, z);
    }

    const line = new Color(C.line);
    const ink = new Color(C.ink);
    const faded = new Color();
    const colour = new Float32Array((vertices.length / 3) * 3);
    for (let i = 0; i < vertices.length; i += 3) {
      const dx = vertices[i] / halfX;
      const dz = (vertices[i + 2] - near) / (far - near);
      const fade = MathUtils.clamp(Math.hypot(dx, dz * 1.1), 0, 1);
      faded.copy(line).lerp(ink, fade * fade);
      colour[i] = faded.r;
      colour[i + 1] = faded.g;
      colour[i + 2] = faded.b;
    }

    return [new Float32Array(vertices), colour];
  }, [halfWidth]);

  return (
    <lineSegments position={[0, -1.95, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colours, 3]} />
      </bufferGeometry>
      <lineBasicMaterial vertexColors transparent opacity={0.9} depthWrite={false} toneMapped={false} />
    </lineSegments>
  );
}

/* ── Dust between the panels ─────────────────────────────────────────────── */

function DustField({ count, spread, tint }: { count: number; spread: number; tint: Color }) {
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<PointsMaterial>(null);

  const positions = useMemo(() => {
    const random = seeded(20260827);
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      array[i * 3] = (random() * 2 - 1) * (spread + 1.6);
      array[i * 3 + 1] = (random() * 2 - 1) * 1.9;
      array[i * 3 + 2] = (random() * 2 - 1) * 2.4;
    }
    return array;
  }, [count, spread]);

  // See the note in DashboardPanel: seeded once, animated from then on.
  useLayoutEffect(() => {
    materialRef.current?.color.copy(tint);
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.018;
    materialRef.current?.color.lerp(tint, 1 - Math.exp(-3.6 * delta));
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={materialRef}
          size={0.035}
          transparent
          opacity={0.55}
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

function Constellation({ accent, lowPower }: { accent: AccentKey; lowPower: boolean }) {
  const rootRef = useRef<Group>(null);
  const tint = useMemo(() => new Color(accentHex[accent]), [accent]);

  const halfWidth = useHalfWidth();
  const spread = MathUtils.clamp(halfWidth * 0.62, 1.5, 5.2);
  const scale = MathUtils.clamp(halfWidth / 5.4, 0.62, 1);

  useFrame((state, delta) => {
    const group = rootRef.current;
    if (!group) return;

    // Bounded drift only. A free-running rotation would swing the outer panels
    // edge-on and out of the banner; the movement lives in the panels instead.
    const damp = 1 - Math.exp(-3.2 * delta);
    const time = state.clock.elapsedTime;
    const targetX = state.pointer.y * 0.09 + Math.sin(time * 0.18) * 0.025;
    const targetY = state.pointer.x * 0.13 + Math.sin(time * 0.13) * 0.045;

    group.rotation.x += (targetX - group.rotation.x) * damp;
    group.rotation.y += (targetY - group.rotation.y) * damp;
  });

  return (
    <group ref={rootRef}>
      <GridFloor halfWidth={halfWidth} />
      <DustField count={lowPower ? 70 : 190} spread={spread} tint={tint} />
      {PANELS.map((panel, i) => (
        <DashboardPanel key={i} panel={panel} tint={tint} spread={spread} scale={scale} />
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

export interface ProductSceneProps {
  /** Accent of the product currently centred in the slider. */
  accent: AccentKey;
}

export function ProductScene({ accent }: ProductSceneProps) {
  const { lowPower } = useWebGL();
  return <Constellation accent={accent} lowPower={lowPower} />;
}

export default ProductScene;
