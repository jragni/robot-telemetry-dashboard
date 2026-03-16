import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { ConnectionError, ConnectionState } from '@/types';

// ---------------------------------------------------------------------------
// Per-robot connection entry
// ---------------------------------------------------------------------------

interface RosConnectionEntry {
  connectionState: ConnectionState;
  error: ConnectionError | null;
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface RosState {
  connections: Record<string, RosConnectionEntry>;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface RosActions {
  setConnectionState(robotId: string, state: ConnectionState): void;
  setConnectionError(robotId: string, error: ConnectionError | null): void;
  removeConnection(robotId: string): void;
  getConnectionState(robotId: string): ConnectionState;
}

// ---------------------------------------------------------------------------
// Full store type
// ---------------------------------------------------------------------------

type RosStore = RosState & RosActions;

// ---------------------------------------------------------------------------
// Default entry factory
// ---------------------------------------------------------------------------

const defaultEntry = (): RosConnectionEntry => ({
  connectionState: 'disconnected',
  error: null,
});

// ---------------------------------------------------------------------------
// Store (no persist — connection state is transient)
// ---------------------------------------------------------------------------

export const useRosStore = create<RosStore>()(
  devtools(
    (set, get) => ({
      connections: {},

      setConnectionState(robotId, state) {
        set(
          (prev) => ({
            connections: {
              ...prev.connections,
              [robotId]: {
                ...(prev.connections[robotId] ?? defaultEntry()),
                connectionState: state,
              },
            },
          }),
          false,
          'ros/setConnectionState'
        );
      },

      setConnectionError(robotId, error) {
        set(
          (prev) => ({
            connections: {
              ...prev.connections,
              [robotId]: {
                ...(prev.connections[robotId] ?? defaultEntry()),
                error,
              },
            },
          }),
          false,
          'ros/setConnectionError'
        );
      },

      removeConnection(robotId) {
        set(
          (prev) => {
            const next = { ...prev.connections };
            delete next[robotId];
            return { connections: next };
          },
          false,
          'ros/removeConnection'
        );
      },

      getConnectionState(robotId) {
        return get().connections[robotId]?.connectionState ?? 'disconnected';
      },
    }),
    { name: 'RosStore' }
  )
);
