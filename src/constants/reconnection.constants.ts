export const RECONNECT_BASE_DELAY = 2000;

export const RECONNECT_MAX_DELAY = 30_000;

export const RECONNECT_MAX_ATTEMPTS = 3;

export function calculateBackoffDelay(attempt: number): number {
  return Math.min(RECONNECT_BASE_DELAY * 2 ** attempt, RECONNECT_MAX_DELAY);
}
