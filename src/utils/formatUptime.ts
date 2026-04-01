/** formatUptime
 * @description Formats a duration in seconds into HH:MM:SS format.
 * @param seconds - The uptime duration in seconds, or null.
 * @returns The formatted string, or a dash for null input.
 */
export function formatUptime(seconds: number | null): string {
  if (seconds == null) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
