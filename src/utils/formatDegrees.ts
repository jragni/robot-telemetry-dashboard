/** formatDegrees
 * @description Formats a number to one decimal place for degree display.
 * @param value - The angle in degrees.
 * @returns The formatted string (e.g., "12.4").
 */
export function formatDegrees(value: number): string {
  return String(Math.round(value * 10) / 10);
}
