import type { ConnectionState } from '@/stores/connection/useConnectionStore.types';

/** selectConnectedCount
 * @description Counts robots currently in the 'connected' state. Used as a
 *  Zustand selector so the footer re-renders only when the count changes.
 * @param state - Connection store state.
 */
export function selectConnectedCount(state: ConnectionState): number {
  return Object.values(state.robots).filter((robot) => robot.status === 'connected').length;
}

/** formatConnectionSummary
 * @description Footer copy for the live connected-robot count, correctly pluralized.
 * @param count - Number of currently connected robots.
 */
export function formatConnectionSummary(count: number): string {
  if (count === 0) return 'No robots connected';
  if (count === 1) return '1 robot connected';
  return `${String(count)} robots connected`;
}
