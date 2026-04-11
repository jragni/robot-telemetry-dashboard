import { Ros } from 'roslib';

import { useConnectionStore } from '@/stores/connection/useConnectionStore';
import { deriveRosbridgeUrl } from '@/stores/connection/useConnectionStore.helpers';
import { calculateBackoffDelay, RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection';
import type { RobotConnection } from '@/stores/connection/useConnectionStore.types';

const CONNECTION_TIMEOUT = 10_000;

/** ConnectionManager
 * @description Manages rosbridge WebSocket connections, reconnection logic, and
 *  connection state. Exported as a singleton instance. Call reset() in tests to
 *  clear all state between test cases.
 */
export class ConnectionManager {
  private connections = new Map<string, Ros>();
  private reconnectTimers = new Map<string, number>();
  private reconnectAttempts = new Map<string, number>();
  private intentionalDisconnects = new Set<string>();
  private connectedAtMap = new Map<string, number>();

  private updateStore(
    id: string,
    patch: Partial<Pick<RobotConnection, 'lastError' | 'lastSeen' | 'reconnectAttempt' | 'status'>>,
  ) {
    useConnectionStore.getState().updateRobot(id, patch);
  }

  private clearReconnect(id: string) {
    const timer = this.reconnectTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(id);
    }
  }

  private scheduleReconnect(id: string, url: string) {
    const robot = useConnectionStore.getState().robots[id];
    if (!robot) return;

    const attempts = this.reconnectAttempts.get(id) ?? 0;
    if (attempts >= RECONNECT_MAX_ATTEMPTS) {
      this.updateStore(id, {
        lastError: `Failed after ${String(RECONNECT_MAX_ATTEMPTS)} attempts`,
        lastSeen: Date.now(),
        reconnectAttempt: null,
        status: 'error',
      });
      this.reconnectAttempts.delete(id);
      return;
    }

    const nextAttempt = attempts + 1;
    this.reconnectAttempts.set(id, nextAttempt);
    this.updateStore(id, { reconnectAttempt: nextAttempt, status: 'connecting' });

    const delay = calculateBackoffDelay(attempts);

    const timer = window.setTimeout(() => {
      this.reconnectTimers.delete(id);
      void this.connect(id, url);
    }, delay);

    this.reconnectTimers.set(id, timer);
  }

  /** @description Connect to a robot's rosbridge WebSocket. Manages reconnection on failure. */
  async connect(id: string, url: string): Promise<void> {
    this.clearReconnect(id);
    const existing = this.connections.get(id);
    if (existing) {
      existing.close();
      this.connections.delete(id);
    }
    this.intentionalDisconnects.delete(id);

    if (!this.reconnectAttempts.has(id)) {
      this.reconnectAttempts.set(id, 0);
    }

    const rosbridgeUrl = deriveRosbridgeUrl(url);
    if (!rosbridgeUrl) throw new Error('Invalid robot URL');

    this.updateStore(id, { lastError: null, status: 'connecting' });

    return new Promise<void>((resolve, reject) => {
      const ros = new Ros({ url: rosbridgeUrl });
      this.connections.set(id, ros);

      let settled = false;
      let wasConnected = false;

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        ros.close();
        this.connections.delete(id);
        this.updateStore(id, { lastError: 'Connection timed out', status: 'error' });
        this.scheduleReconnect(id, url);
        reject(new Error('Connection timed out'));
      }, CONNECTION_TIMEOUT);

      ros.on('connection', () => {
        if (settled) return;
        settled = true;
        wasConnected = true;
        clearTimeout(timeout);
        this.reconnectAttempts.delete(id);
        this.connectedAtMap.set(id, Date.now());
        this.updateStore(id, {
          lastError: null,
          lastSeen: Date.now(),
          reconnectAttempt: null,
          status: 'connected',
        });
        resolve();
      });

      ros.on('error', (err: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        this.connections.delete(id);
        const message = err instanceof Error ? err.message : 'Connection error';
        this.updateStore(id, { lastError: message, lastSeen: Date.now(), status: 'error' });
        this.scheduleReconnect(id, url);
        reject(new Error(message));
      });

      ros.on('close', () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          this.connections.delete(id);
          this.updateStore(id, { lastSeen: Date.now(), status: 'disconnected' });
          reject(new Error('Connection closed'));
          return;
        }

        this.connections.delete(id);

        if (!wasConnected) return;
        if (this.intentionalDisconnects.has(id)) {
          this.intentionalDisconnects.delete(id);
          return;
        }
        const robot = useConnectionStore.getState().robots[id];
        if (robot) {
          this.scheduleReconnect(id, url);
        }
      });
    });
  }

  /** @description Intentionally disconnect a robot and prevent auto-reconnect. */
  disconnect(id: string): void {
    this.clearReconnect(id);
    this.reconnectAttempts.delete(id);
    this.connectedAtMap.delete(id);
    this.intentionalDisconnects.add(id);

    const ros = this.connections.get(id);
    if (ros) {
      ros.close();
      this.connections.delete(id);
    }

    this.updateStore(id, {
      lastError: null,
      lastSeen: Date.now(),
      reconnectAttempt: null,
      status: 'disconnected',
    });
  }

  /** @description Test if a rosbridge URL is reachable without persisting the connection. */
  async testConnection(url: string, timeoutMs = CONNECTION_TIMEOUT): Promise<void> {
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
        reject(
          new Error('Connection timed out — check the URL and ensure the robot is powered on'),
        );
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

  /** @description Get the active Ros instance for a robot, if connected. */
  getConnection(id: string): Ros | undefined {
    return this.connections.get(id);
  }

  /** @description Get the timestamp when a robot connected, or null if not connected. */
  getConnectedAt(id: string): number | null {
    return this.connectedAtMap.get(id) ?? null;
  }

  /** reset — clears all internal state. Use in tests only. */
  reset(): void {
    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    for (const ros of this.connections.values()) {
      ros.close();
    }
    this.connections.clear();
    this.reconnectTimers.clear();
    this.reconnectAttempts.clear();
    this.intentionalDisconnects.clear();
    this.connectedAtMap.clear();
  }
}

export const connectionManager = new ConnectionManager();
