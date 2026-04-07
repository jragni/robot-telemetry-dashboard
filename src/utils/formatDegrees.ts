/** formatDegrees
 * @description Formats a numeric angle to one decimal place as a string.
 * @param value - Angle in degrees.
 */
export function formatDegrees(value: number): string {
  return String(Math.round(value * 10) / 10);
}
