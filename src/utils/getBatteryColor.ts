/** BATTERY_THRESHOLDS
 * @description Battery percentage thresholds for status color changes.
 */
const BATTERY_THRESHOLDS = {
  critical: 15,
  caution: 30,
} as const;

/** getBatteryColor
 * @description Returns the appropriate status color class for a battery
 *  percentage. Uses consistent thresholds across all features.
 * @param percentage - Battery percentage (0-100), or null if unknown.
 * @returns Tailwind text color class string.
 */
export function getBatteryColor(percentage: number | null): string {
  if (percentage === null) return 'text-text-muted';
  if (percentage <= BATTERY_THRESHOLDS.critical) return 'text-status-critical';
  if (percentage <= BATTERY_THRESHOLDS.caution) return 'text-status-caution';
  return 'text-status-nominal';
}
