const BATTERY_THRESHOLDS = {
  critical: 15,
  caution: 30,
} as const;

/** getBatteryColor
 * @description Returns a Tailwind text color class based on battery percentage thresholds.
 * @param percentage - Battery level 0-100, or null.
 */
export function getBatteryColor(percentage: number | null): string {
  if (percentage === null || Number.isNaN(percentage)) return 'text-text-muted';
  if (percentage <= BATTERY_THRESHOLDS.critical) return 'text-status-critical';
  if (percentage <= BATTERY_THRESHOLDS.caution) return 'text-status-caution';
  return 'text-status-nominal';
}
