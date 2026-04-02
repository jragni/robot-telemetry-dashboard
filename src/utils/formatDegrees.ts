export function formatDegrees(value: number): string {
  return String(Math.round(value * 10) / 10);
}
