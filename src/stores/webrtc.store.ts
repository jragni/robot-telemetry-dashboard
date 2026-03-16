import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import type { ConnectionError, ConnectionState } from '@/types';

// ---------------------------------------------------------------------------
// Per-robot connection entry
// ---------------------------------------------------------------------------

interface WebRTCConnectionEntry {
  connectionState: ConnectionState;
  error: ConnectionError | null;
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface WebRTCState {
  connections: Record<string, WebRTCConnectionEntry>;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

interface WebRTCActions {
  setConnectionState(robotId: string, state: ConnectionState): void;
  setConnectionError(robotId: string, error: ConnectionError | null): void;
  removeConnection(robotId: string): void;
  getConnectionState(robotId: string): ConnectionState;
}

// ---------------------------------------------------------------------------
// Full store type
// ---------------------------------------------------------------------------

type WebRTCStore = WebRTCState & WebRTCActions;

// ---------------------------------------------------------------------------
// Default entry factory
// ---------------------------------------------------------------------------

const defaultEntry = (): WebRTCConnectionEntry => ({
  connectionState: 'disconnected',
  error: null,
});

// ---------------------------------------------------------------------------
// Store (no persist — connection state is transient)
// ---------------------------------------------------------------------------

export const useWebRTCStore = create<WebRTCStore>()(
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
          'webrtc/setConnectionState'
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
          'webrtc/setConnectionError'
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
          'webrtc/removeConnection'
        );
      },

      getConnectionState(robotId) {
        return get().connections[robotId]?.connectionState ?? 'disconnected';
      },
    }),
    { name: 'WebRTCStore' }
  )
);
