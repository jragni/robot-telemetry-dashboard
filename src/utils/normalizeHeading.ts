/** normalizeHeading
 * @description Normalizes a heading angle to the 0-360 degree range.
 * @param degrees - The heading angle in degrees (may be negative or >360).
 * @returns The normalized heading in the range [0, 360).
 */
export function normalizeHeading(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}
