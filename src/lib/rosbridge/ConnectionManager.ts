import { Ros } from 'roslib';
import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import type { RobotConnection } from '@/stores/connection/useConnectionStore.types';
import { deriveRosbridgeUrl } from '@/stores/connection/useConnectionStore.helpers';
import {
  RECONNECT_MAX_ATTEMPTS,
  calculateBackoffDelay,
} from '@/constants/reconnection.constants';

/** CONNECTION_TIMEOUT
 * @description Maximum time to wait for a WebSocket handshake in ms.
 */
const CONNECTION_TIMEOUT = 10_000;

/** connections
 * @description Global map of active Ros instances keyed by robot ID.
 *  Survives component mounts/unmounts. Module-scoped singleton.
 */
const connections = new Map<string, Ros>();

/** reconnectTimers
 * @description Tracks pending reconnection timeouts per robot ID.
 */
const reconnectTimers = new Map<string, number>();

/** reconnectAttempts
 * @description Tracks reconnection attempt counts per robot ID.
 */
const reconnectAttempts = new Map<string, number>();

/** intentionalDisconnects
 * @description Tracks robots being intentionally disconnected so the close
 *  handler doesn't trigger auto-reconnect.
 */
const intentionalDisconnects = new Set<string>();

/** connectedAtMap
 * @description Tracks when each robot connected, for uptime calculation.
 */
const connectedAtMap = new Map<string, number>();

// ── Store helper ─────────────────────────────────────────────────

/** updateStore
 * @description Pushes a status patch into the Zustand store from outside React.
 */
function updateStore(id: string, patch: Partial<Pick<RobotConnection, 'status' | 'lastSeen' | 'lastError'>>) {
  useConnectionStore.getState().updateRobot(id, patch);
}

// ── Reconnection ─────────────────────────────────────────────────

/** clearReconnect
 * @description Cancels any pending reconnection for a robot.
 */
function clearReconnect(id: string) {
  const timer = reconnectTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    reconnectTimers.delete(id);
  }
}

/** scheduleReconnect
 * @description Queues an auto-reconnect with exponential backoff.
 * @param id - Robot ID to reconnect.
 * @param url - Robot base URL.
 */
function scheduleReconnect(id: string, url: string) {
  const robot = useConnectionStore.getState().robots[id];
  if (!robot) return;

  const attempts = reconnectAttempts.get(id) ?? 0;
  if (attempts >= RECONNECT_MAX_ATTEMPTS) {
    updateStore(id, { status: 'error', lastError: `Failed after ${String(RECONNECT_MAX_ATTEMPTS)} attempts` });
    reconnectAttempts.delete(id);
    return;
  }

  updateStore(id, { status: 'connecting' });
  reconnectAttempts.set(id, attempts + 1);

  const delay = calculateBackoffDelay(attempts);

  const timer = window.setTimeout(() => {
    reconnectTimers.delete(id);
    void connect(id, url);
  }, delay);

  reconnectTimers.set(id, timer);
}

// ── Public API ───────────────────────────────────────────────────

/** connect
 * @description Creates a roslib Ros instance, connects to the robot's
 *  rosbridge endpoint, and pushes status changes into the Zustand store.
 *  Resolves when connected, rejects on error or timeout.
 * @param id - Robot ID in the connection store.
 * @param url - Robot base URL (e.g., ws://192.168.1.10).
 */
export async function connect(id: string, url: string): Promise<void> {
  // Clean up existing connection without resetting retry state
  clearReconnect(id);
  const existing = connections.get(id);
  if (existing) {
    existing.close();
    connections.delete(id);
  }
  intentionalDisconnects.delete(id);

  // Count this as an attempt if not already tracking (initial connect)
  if (!reconnectAttempts.has(id)) {
    reconnectAttempts.set(id, 1);
  }

  const rosbridgeUrl = deriveRosbridgeUrl(url);
  if (!rosbridgeUrl) throw new Error('Invalid robot URL');

  updateStore(id, { status: 'connecting', lastError: null });

  return new Promise<void>((resolve, reject) => {
    const ros = new Ros({ url: rosbridgeUrl });
    connections.set(id, ros);

    let settled = false;
    let wasConnected = false;

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      ros.close();
      connections.delete(id);
      updateStore(id, { status: 'error', lastError: 'Connection timed out' });
      scheduleReconnect(id, url);
      reject(new Error('Connection timed out'));
    }, CONNECTION_TIMEOUT);

    ros.on('connection', () => {
      if (settled) return;
      settled = true;
      wasConnected = true;
      clearTimeout(timeout);
      reconnectAttempts.delete(id);
      connectedAtMap.set(id, Date.now());
      updateStore(id, { status: 'connected', lastSeen: Date.now(), lastError: null });
      resolve();
    });

    ros.on('error', (err: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      connections.delete(id);
      const message = err instanceof Error ? err.message : 'Connection error';
      updateStore(id, { status: 'error', lastError: message });
      scheduleReconnect(id, url);
      reject(err);
    });

    ros.on('close', () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        connections.delete(id);
        updateStore(id, { status: 'disconnected' });
        reject(new Error('Connection closed'));
        return;
      }

      connections.delete(id);

      // Only auto-reconnect if we were previously connected (involuntary drop)
      // Don't reconnect from a failed initial connection attempt
      if (!wasConnected) return;
      if (intentionalDisconnects.has(id)) {
        intentionalDisconnects.delete(id);
        return;
      }
      const robot = useConnectionStore.getState().robots[id];
      if (robot) {
        scheduleReconnect(id, url);
      }
    });
  });
}

/** disconnect
 * @description Gracefully closes the Ros connection and cleans up state.
 * @param id - Robot ID to disconnect.
 */
export function disconnect(id: string): void {
  clearReconnect(id);
  reconnectAttempts.delete(id);
  connectedAtMap.delete(id);
  intentionalDisconnects.add(id);

  const ros = connections.get(id);
  if (ros) {
    ros.close();
    connections.delete(id);
  }

  updateStore(id, { status: 'disconnected', lastError: null });
}

/** testConnection
 * @description Tests whether a robot is reachable by attempting a temporary
 *  rosbridge connection. Always cleans up — never leaves a connection open.
 * @param url - Robot base URL to test.
 * @param timeoutMs - Maximum wait time in ms (default 10s).
 * @returns Resolves on success, rejects with error message on failure.
 */
export async function testConnection(url: string, timeoutMs = CONNECTION_TIMEOUT): Promise<void> {
  const rosbridgeUrl = deriveRosbridgeUrl(url);
  if (!rosbridgeUrl) throw new Error('Invalid robot URL');

  return new Promise<void>((resolve, reject) => {
    const ros = new Ros({ url: rosbridgeUrl });
    let settled = false;

    const cleanup = () => {
      ros.close();
    };

    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Connection timed out — check the URL and ensure the robot is powered on'));
    }, timeoutMs);

    ros.on('connection', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      cleanup();
      resolve();
    });

    ros.on('error', (err: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      cleanup();
      reject(err instanceof Error ? err : new Error('Connection error'));
    });

    ros.on('close', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(new Error('Connection closed unexpectedly'));
    });
  });
}

/** getConnection
 * @description Returns the live Ros instance for a robot, if connected.
 *  Used by workspace panels to subscribe to ROS topics.
 * @param id - Robot ID.
 */
export function getConnection(id: string): Ros | undefined {
  return connections.get(id);
}

/** getConnectedAt
 * @description Returns the timestamp when a robot connected, or null if not connected.
 * @param id - Robot ID.
 */
export function getConnectedAt(id: string): number | null {
  return connectedAtMap.get(id) ?? null;
}
