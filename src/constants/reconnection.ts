/** Initial reconnection delay in ms. */
export const RECONNECT_BASE_DELAY = 2000;

/** Maximum reconnection delay in ms (backoff cap). */
export const RECONNECT_MAX_DELAY = 30_000;

/** Maximum auto-reconnect attempts before surfacing error. */
export const RECONNECT_MAX_ATTEMPTS = 3;

/** calculateBackoffDelay
 * @description Calculates exponential backoff delay capped at RECONNECT_MAX_DELAY.
 * @param attempt - Zero-based attempt number.
 */
export function calculateBackoffDelay(attempt: number): number {
  return Math.min(RECONNECT_BASE_DELAY * 2 ** attempt, RECONNECT_MAX_DELAY);
}
