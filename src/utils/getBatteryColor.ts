const BATTERY_THRESHOLDS = {
  critical: 15,
  caution: 30,
} as const;

export function getBatteryColor(percentage: number | null): string {
  if (percentage === null || Number.isNaN(percentage)) return 'text-text-muted';
  if (percentage <= BATTERY_THRESHOLDS.critical) return 'text-status-critical';
  if (percentage <= BATTERY_THRESHOLDS.caution) return 'text-status-caution';
  return 'text-status-nominal';
}
