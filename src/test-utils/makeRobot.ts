import type {
  ConnectionStatus,
  RobotConnection,
} from '@/stores/connection/useConnectionStore.types';

/** makeRobot
 * @description Builds a RobotConnection for tests with sensible defaults; only
 *  id and status usually matter to the caller.
 * @param id - Robot id (also used as the name).
 * @param status - Connection status to set.
 */
export function makeRobot(id: string, status: ConnectionStatus): RobotConnection {
  return {
    id,
    name: id,
    url: 'ws://x',
    status,
    lastSeen: null,
    lastError: null,
    reconnectAttempt: null,
    color: 'blue',
    selectedTopics: {},
  };
}
