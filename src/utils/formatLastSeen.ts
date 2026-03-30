/**
 * Format a timestamp to relative time string. Returns dash for null.
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
