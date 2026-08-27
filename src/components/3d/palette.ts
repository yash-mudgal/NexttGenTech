import { accentOf } from "@/lib/accent";

/* ============================================================================
 * 3D PALETTE
 * ----------------------------------------------------------------------------
 * three.js needs raw colour values, so every scene reads them from here rather
 * than hardcoding hex — this stays in step with the Tailwind design tokens via
 * the accent registry.
 * ========================================================================== */

export const C = {
  brand: accentOf("brand").hex,
  brandDeep: accentOf("brand").hexDeep,
  cyan: accentOf("cyan").hex,
  cyanDeep: accentOf("cyan").hexDeep,
  violet: accentOf("violet").hex,
  violetDeep: accentOf("violet").hexDeep,
  emerald: accentOf("emerald").hex,
  amber: accentOf("amber").hex,
  rose: accentOf("rose").hex,
  ink: "#04060c",
  surface: "#0d1424",
  line: "#26314f",
  fg: "#e9eefb",
} as const;

/** Accent name → hex, for scenes driven by product/section accent. */
export const accentHex = {
  brand: C.brand,
  cyan: C.cyan,
  violet: C.violet,
  emerald: C.emerald,
  amber: C.amber,
  rose: C.rose,
} as const;

export type AccentKey = keyof typeof accentHex;
