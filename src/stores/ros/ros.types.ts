import type { ConnectionError, ConnectionState, TopicInfo } from '@/types';

// ---------------------------------------------------------------------------
// Per-robot connection entry
// ---------------------------------------------------------------------------

export interface RosConnectionEntry {
  connectionState: ConnectionState;
  error: ConnectionError | null;
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface RosState {
  connections: Record<string, RosConnectionEntry>;
  topics: Record<string, TopicInfo[]>;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

export interface RosActions {
  setConnectionState(robotId: string, state: ConnectionState): void;
  setConnectionError(robotId: string, error: ConnectionError | null): void;
  removeConnection(robotId: string): void;
  getConnectionState(robotId: string): ConnectionState;
  setTopics(robotId: string, topics: TopicInfo[]): void;
  getTopics(robotId: string): TopicInfo[];
}
