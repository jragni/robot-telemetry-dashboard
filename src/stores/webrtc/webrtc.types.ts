import type {
  ConnectionError,
  ConnectionState,
} from '@/types/connection.types';

// ---------------------------------------------------------------------------
// Per-robot connection entry
// ---------------------------------------------------------------------------

export interface WebRTCConnectionEntry {
  connectionState: ConnectionState;
  error: ConnectionError | null;
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface WebRTCState {
  connections: Record<string, WebRTCConnectionEntry>;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

export interface WebRTCActions {
  setConnectionState(robotId: string, state: ConnectionState): void;
  setConnectionError(robotId: string, error: ConnectionError | null): void;
  removeConnection(robotId: string): void;
  getConnectionState(robotId: string): ConnectionState;
}
