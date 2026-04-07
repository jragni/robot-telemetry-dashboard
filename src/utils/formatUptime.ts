import { SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from './formatUptime.constants';

/** formatUptime
 * @description Formats seconds into HH:MM:SS uptime string.
 * @param seconds - Total uptime in seconds, or null.
 */
export function formatUptime(seconds: number | null): string {
  if (seconds == null) return '—';
  const h = Math.floor(seconds / SECONDS_PER_HOUR);
  const m = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const s = Math.floor(seconds % SECONDS_PER_MINUTE);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
