import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Instance, Instances, Line } from "@react-three/drei";
import { AdditiveBlending, BackSide, MathUtils, Vector3 } from "three";
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import { C } from "@/components/3d/palette";
import { aiNodes } from "@/data/ai";
import { useWebGL } from "@/hooks";
import { cn } from "@/lib/cn";

/* ============================================================================
 * AI NEURAL NETWORK — WebGL scene
 * ----------------------------------------------------------------------------
 * Lazy-loaded by AISection. Nothing here may be imported eagerly: the `three`
 * chunk has to stay out of the initial bundle.
 *
 * A four-layer network — input, two hidden layers and an output layer — funnel-
 * ing through a central engine, with signals running left to right. The seven
 * nodes from the data layer are named neurons inside that network; the rest are
 * anonymous and instanced.
 *
 * The scene is decorative. Selection lives in AISection's <button> list and
 * arrives as `activeId`; the scene mirrors it and never owns it.
 * ========================================================================== */

export interface NeuralSceneProps {
  /** Node currently hovered, focused or selected in the button list. */
  activeId: string | null;
  /** Label on the central engine. */
  coreLabel: string;
  /** Phone layout: run without chips and with fewer signals. */
  compact: boolean;
}

/* ── Layout ──────────────────────────────────────────────────────────────────
 * Layer x positions are deliberately tight. At camera z = 9.5 / fov 45 the
 * half-extent at the origin plane is 3.93 world units, and an <Html> chip does
 * not scale with the canvas — so the widest label ("Business Intelligence",
 * ~160px) costs more world units the smaller the box gets. Holding the outer
 * layers at ±2.55 and nudging their chips 28% back toward the centre keeps the
 * furthest chip edge inside the frame down to a ~420px box, which is the
 * narrowest this column ever gets before the phone layout drops chips entirely.
 * -------------------------------------------------------------------------- */

interface LayerSpec {
  x: number;
  size: number;
  /** Half the vertical span the layer occupies. */
  spread: number;
  colour: string;
  /** Horizontal nudge for this layer's chips, as a fraction of chip width. */
  chipShift: string;
}

const LAYERS: LayerSpec[] = [
  { x: -2.55, size: 5, spread: 1.8, colour: C.violet, chipShift: "translateX(28%)" },
  { x: -1.3, size: 7, spread: 2.4, colour: C.violet, chipShift: "" },
  { x: 1.3, size: 7, spread: 2.4, colour: C.brand, chipShift: "" },
  { x: 2.55, size: 4, spread: 1.55, colour: C.cyan, chipShift: "translateX(-28%)" },
];

/** Where each named node sits: [layer, slot]. Chosen so no two share a row. */
const NODE_SLOTS: Record<string, [number, number]> = {
  data: [0, 2],
  ml: [1, 1],
  llm: [1, 5],
  automation: [2, 1],
  analytics: [2, 5],
  prediction: [3, 0],
  bi: [3, 3],
};

/** How far above its neuron a label chip floats. */
const LABEL_LIFT = 0.4;

const CORE_POSITION = new Vector3(0, 0, 0);

function neuronAt(layer: number, slot: number): Vector3 {
  const spec = LAYERS[layer];
  const y = spec.size > 1 ? spec.spread - (slot / (spec.size - 1)) * spec.spread * 2 : 0;
  // A deterministic depth offset, so the layers read as sheets in space rather
  // than flat columns — and so it looks the same on every load.
  const z = Math.sin(layer * 2.7 + slot * 1.9) * 0.5;
  return new Vector3(spec.x, y, z);
}

/** Deterministic 0–1 noise, so signal routing never differs between visits. */
function noise(seed: number): number {
  const value = Math.sin(seed * 127.1) * 43758.5453;
  return value - Math.floor(value);
}

/* ── Named neuron ────────────────────────────────────────────────────────── */

interface NamedNeuronProps {
  label: string;
  position: Vector3;
  colour: string;
  chipShift: string;
  active: boolean;
  dimmed: boolean;
  showChip: boolean;
}

function NamedNeuron({
  label,
  position,
  colour,
  chipShift,
  active,
  dimmed,
  showChip,
}: NamedNeuronProps) {
  const coreRef = useRef<Mesh>(null);
  const haloRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const haloMaterialRef = useRef<MeshBasicMaterial>(null);

  useFrame((_, delta) => {
    const damp = 1 - Math.exp(-8 * delta);

    if (coreRef.current) {
      coreRef.current.scale.setScalar(
        MathUtils.lerp(coreRef.current.scale.x, active ? 1.7 : 1, damp),
      );
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(
        MathUtils.lerp(haloRef.current.scale.x, active ? 1.6 : 1, damp),
      );
    }
    if (haloMaterialRef.current) {
      haloMaterialRef.current.opacity = MathUtils.lerp(
        haloMaterialRef.current.opacity,
        active ? 0.3 : dimmed ? 0.05 : 0.14,
        damp,
      );
    }
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = MathUtils.lerp(
        materialRef.current.emissiveIntensity,
        active ? 1.2 : dimmed ? 0.15 : 0.5,
        damp,
      );
      materialRef.current.opacity = MathUtils.lerp(
        materialRef.current.opacity,
        dimmed ? 0.35 : 1,
        damp,
      );
    }
  });

  return (
    <group position={position}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.16, 1]} />
        <meshStandardMaterial
          ref={materialRef}
          color={colour}
          emissive={colour}
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.2}
          transparent
          toneMapped={false}
        />
      </mesh>

      <mesh ref={haloRef}>
        <sphereGeometry args={[0.32, 14, 14]} />
        <meshBasicMaterial
          ref={haloMaterialRef}
          color={colour}
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/*
        <Html> rather than drei's <Text>: troika parses the font file itself and
        never resolves against this project's variable woff2, which leaves the
        Suspense boundary hanging forever.
      */}
      {showChip && (
        <Html
          center
          position={[0, LABEL_LIFT, 0]}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            style={chipShift ? { transform: chipShift } : undefined}
            className={cn(
              "flex select-none items-center gap-1.5 whitespace-nowrap rounded-full border",
              "px-2 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] backdrop-blur-sm",
              "transition-[color,background-color,border-color,opacity] duration-300 sm:text-[0.5625rem]",
              active
                ? "border-ng-violet/50 bg-ng-violet/15 text-ng-fg"
                : "border-ng-line bg-ng-surface/75 text-ng-fg2",
              dimmed && "opacity-45",
            )}
          >
            <span className="size-1 shrink-0 rounded-full" style={{ backgroundColor: colour }} />
            {label}
          </span>
        </Html>
      )}
    </group>
  );
}

/* ── Signal ──────────────────────────────────────────────────────────────── */

interface SignalProps {
  /** input → hidden A → engine → hidden B → output. */
  waypoints: Vector3[];
  offset: number;
  speed: number;
}

/** One packet travelling left to right along a fixed route through the net. */
function Signal({ waypoints, offset, speed }: SignalProps) {
  const ref = useRef<Mesh>(null);
  // Reused every frame — never allocate inside useFrame.
  const scratch = useMemo(() => new Vector3(), []);
  const legs = waypoints.length - 1;

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = (state.clock.elapsedTime * speed + offset) % 1;
    const scaled = t * legs;
    const leg = Math.min(Math.floor(scaled), legs - 1);
    scratch.lerpVectors(waypoints[leg], waypoints[leg + 1], scaled - leg);
    mesh.position.copy(scratch);
    // Fade in and out at the ends so packets appear to enter and leave the net.
    mesh.scale.setScalar(0.35 + Math.sin(t * Math.PI) * 0.9);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial
        color={C.cyan}
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ── Engine core ─────────────────────────────────────────────────────────── */

function EngineCore({ label }: { label: string }) {
  const ref = useRef<Group>(null);

  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;
    group.rotation.y += delta * 0.24;
    group.rotation.x -= delta * 0.07;
    group.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.9) * 0.05);
  });

  return (
    <group>
      <group ref={ref}>
        <mesh>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial
            color={C.violetDeep}
            emissive={C.violet}
            emissiveIntensity={0.75}
            roughness={0.25}
            metalness={0.35}
            toneMapped={false}
          />
        </mesh>

        {/* Wireframe cage */}
        <mesh>
          <icosahedronGeometry args={[0.66, 1]} />
          <meshBasicMaterial
            color={C.violet}
            wireframe
            transparent
            opacity={0.45}
            toneMapped={false}
          />
        </mesh>

        {/* Inner-lit shell — the section's single focal glow. */}
        <mesh>
          <sphereGeometry args={[0.92, 20, 20]} />
          <meshBasicMaterial
            color={C.violet}
            transparent
            opacity={0.11}
            side={BackSide}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* The engine keeps its chip at every size — it is short, central, and
          the one label the network needs to be legible. */}
      <Html center position={[0, -1.2, 0]} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <span className="ng-glass select-none whitespace-nowrap rounded-full px-3 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-ng-fg">
          {label}
        </span>
      </Html>
    </group>
  );
}

/* ── Scene ───────────────────────────────────────────────────────────────── */

export function NeuralScene({ activeId, coreLabel, compact }: NeuralSceneProps) {
  const { lowPower } = useWebGL();
  const driftRef = useRef<Group>(null);

  /* Every neuron position, the named ones lifted out of the instanced set, and
   * the line buffers — all built once. */
  const { named, anonymous, layerLinks, coreLinks } = useMemo(() => {
    const grid = LAYERS.map((spec, layer) =>
      Array.from({ length: spec.size }, (_, slot) => neuronAt(layer, slot)),
    );

    const namedNeurons = aiNodes.map((node) => {
      const [layer, slot] = NODE_SLOTS[node.id] ?? [1, 3];
      return { node, layer, position: grid[layer][slot] };
    });
    const claimed = new Set(namedNeurons.map((entry) => entry.position));

    const anonymousNeurons: { position: Vector3; colour: string }[] = [];
    grid.forEach((layer, layerIndex) => {
      layer.forEach((position) => {
        if (claimed.has(position)) return;
        anonymousNeurons.push({ position, colour: LAYERS[layerIndex].colour });
      });
    });

    // Fully-connected between adjacent sheets, one <Line segments> for the lot.
    const between: Vector3[] = [];
    [
      [0, 1],
      [2, 3],
    ].forEach(([from, to]) => {
      grid[from].forEach((a) => {
        grid[to].forEach((b) => between.push(a, b));
      });
    });

    // Both hidden sheets meet at the engine, so every path runs through it.
    const throughCore: Vector3[] = [];
    grid[1].forEach((position) => throughCore.push(position, CORE_POSITION));
    grid[2].forEach((position) => throughCore.push(CORE_POSITION, position));

    return {
      named: namedNeurons,
      anonymous: anonymousNeurons,
      layerLinks: between,
      coreLinks: throughCore,
    };
  }, []);

  /* Signal routes. Staggered offsets and slightly different speeds, so packets
   * never fire in unison and the loop never visibly repeats. */
  const signals = useMemo(() => {
    const count = lowPower ? 5 : 9;
    return Array.from({ length: count }, (_, index) => {
      const pick = (layer: number, seed: number) =>
        neuronAt(layer, Math.floor(noise(seed) * LAYERS[layer].size));
      return {
        waypoints: [
          pick(0, index + 1),
          pick(1, index + 21),
          CORE_POSITION,
          pick(2, index + 41),
          pick(3, index + 61),
        ],
        offset: index / count,
        speed: 0.16 + noise(index + 81) * 0.09,
      };
    });
  }, [lowPower]);

  useFrame((state, delta) => {
    const group = driftRef.current;
    if (!group) return;

    // Bounded drift plus pointer parallax. A free-running rotation would swing
    // the layers edge-on and collapse the network into a line, so the whole
    // assembly stays camera-facing; peak |rotation.y| is 0.22 rad, which the
    // chip containment figures at the top of the file assume.
    const damp = 1 - Math.exp(-3.2 * delta);
    const time = state.clock.elapsedTime;
    const targetX = state.pointer.y * 0.12 + Math.sin(time * 0.23) * 0.045;
    const targetY = state.pointer.x * 0.14 + Math.sin(time * 0.19) * 0.08;

    group.rotation.x += (targetX - group.rotation.x) * damp;
    group.rotation.y += (targetY - group.rotation.y) * damp;
  });

  return (
    <group ref={driftRef}>
      <Line
        segments
        points={layerLinks}
        color={C.brand}
        lineWidth={1}
        transparent
        opacity={activeId ? 0.1 : 0.16}
        depthWrite={false}
        toneMapped={false}
      />
      <Line
        segments
        points={coreLinks}
        color={C.violet}
        lineWidth={1}
        transparent
        opacity={activeId ? 0.16 : 0.28}
        depthWrite={false}
        toneMapped={false}
      />

      {/* Unnamed neurons — one draw call for the lot. */}
      <Instances limit={anonymous.length} range={anonymous.length}>
        <sphereGeometry args={[0.085, 10, 10]} />
        <meshStandardMaterial
          roughness={0.45}
          metalness={0.1}
          transparent
          opacity={0.75}
          toneMapped={false}
        />
        {anonymous.map((neuron, index) => (
          <Instance key={index} position={neuron.position} color={neuron.colour} />
        ))}
      </Instances>

      {named.map(({ node, layer, position }) => (
        <NamedNeuron
          key={node.id}
          label={node.label}
          position={position}
          colour={LAYERS[layer].colour}
          chipShift={LAYERS[layer].chipShift}
          active={activeId === node.id}
          dimmed={activeId !== null && activeId !== node.id}
          showChip={!compact}
        />
      ))}

      <EngineCore label={coreLabel} />

      {signals.map((signal, index) => (
        <Signal key={index} {...signal} />
      ))}
    </group>
  );
}

export default NeuralScene;
