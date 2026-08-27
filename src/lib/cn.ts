/**
 * Join conditional class names. Falsy values are dropped.
 *
 * `bigint` and `boolean` are accepted so the common `cond && "class"` pattern
 * type-checks even when `cond` is a ReactNode (whose falsy members include
 * `0n` and `false`).
 */
export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (value: ClassValue) => {
    if (value === null || value === undefined || value === false || value === true) return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value === "") return;
    out.push(String(value));
  };
  inputs.forEach(walk);
  return out.join(" ");
}
