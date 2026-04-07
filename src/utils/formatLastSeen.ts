import {
  JUST_NOW_THRESHOLD_MS,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_SECOND,
} from './formatLastSeen.constants';

/** formatLastSeen
 * @description Formats a timestamp into a human-readable relative time string (e.g., "just now", "5s ago").
 * @param timestamp - Unix timestamp in milliseconds, or null.
 */
export function formatLastSeen(timestamp: number | null): string {
  if (timestamp == null) return '—';
  const delta = Date.now() - timestamp;
  if (delta < JUST_NOW_THRESHOLD_MS) return 'just now';
  if (delta < MS_PER_MINUTE) return `${String(Math.floor(delta / MS_PER_SECOND))}s ago`;
  if (delta < MS_PER_HOUR) return `${String(Math.floor(delta / MS_PER_MINUTE))}m ago`;
  const hours = Math.floor(delta / MS_PER_HOUR);
  return `${String(hours)}h ago`;
}
