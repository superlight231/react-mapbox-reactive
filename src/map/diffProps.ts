// Keys of `next` whose values differ from `prev` by reference (Object.is).
export function diffKeys(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): string[] {
  return Object.keys(next).filter((key) => !Object.is(prev[key], next[key]))
}
