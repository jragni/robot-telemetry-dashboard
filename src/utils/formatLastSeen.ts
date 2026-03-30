/**
 * Formats a timestamp into a relative time string (e.g., "just now", "5s ago").
 * @param timestamp - The epoch timestamp in milliseconds, or null.
 * @returns The relative time string, or a dash for null input.
 */
export function formatLastSeen(timestamp: number | null): string {
  if (timestamp == null) return '—';
  const delta = Date.now() - timestamp;
  if (delta < 5000) return 'just now';
  if (delta < 60000) return `${String(Math.floor(delta / 1000))}s ago`;
  if (delta < 3600000) return `${String(Math.floor(delta / 60000))}m ago`;
  const hours = Math.floor(delta / 3600000);
  return `${String(hours)}h ago`;
}
