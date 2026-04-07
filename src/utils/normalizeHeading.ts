/** normalizeHeading
 * @description Wraps a degree value into the 0-360 range.
 * @param degrees - Heading angle to normalize.
 */
export function normalizeHeading(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}
