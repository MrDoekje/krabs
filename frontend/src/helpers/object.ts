/**
 * A reusable type guard to check if a value is a non-empty object.
 * It filters out null, undefined, and objects with no keys (like Record<never, never>).
 *
 * @param value The value to check.
 * @returns `true` if the value is an object with at least one key.
 */
export function isNonEmptyObject<T extends object>(
  value: T | null | undefined
): value is T {
  // 1. Check if the value is truthy (not null or undefined).
  // 2. Check if it has more than 0 keys.
  return !!value && Object.keys(value).length > 0;
}