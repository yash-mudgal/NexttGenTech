import { C } from "./palette";

/**
 * Shared lighting rig.
 *
 * Every section scene mounts this so the whole site reads as one continuous
 * 3D world rather than a dozen differently-lit boxes. Deliberately restrained:
 * a cool key, a brand-tinted rim and a violet fill, matching the design
 * system's blue → cyan → violet language.
 */
export function Rig({ intensity = 1 }: { intensity?: number }) {
  return (
    <>
      <ambientLight intensity={0.55 * intensity} color={C.fg} />
      {/* Key — cool white, front-right and above. */}
      <directionalLight position={[4, 6, 6]} intensity={1.5 * intensity} color="#dce9ff" />
      {/* Rim — brand blue from behind-left, separates objects from the page. */}
      <directionalLight position={[-6, 2, -5]} intensity={1.9 * intensity} color={C.brand} />
      {/* Fill — violet from below, keeps shadows from going flat black. */}
      <pointLight position={[0, -4, 3]} intensity={5 * intensity} distance={18} color={C.violet} />
      {/* Accent — cyan specular kick. */}
      <pointLight position={[5, 1, 4]} intensity={4 * intensity} distance={16} color={C.cyan} />
    </>
  );
}

export default Rig;
