/**
 * Returns the keys of `next` whose values differ from `prev` (by reference
 * equality). Pulled out of Layer.tsx so the diffing behavior — the part
 * that decides how many imperative Mapbox calls an update actually costs —
 * can be unit tested without needing a real mapboxgl.Map.
 */
export function diffKeys(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): string[] {
  return Object.keys(next).filter((key) => !Object.is(prev[key], next[key]))
}
