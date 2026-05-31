import { describe, expect, it } from 'vitest';

import { formatConnectionSummary, selectConnectedCount } from './StatusBar.helpers';
import type {
  ConnectionState,
  RobotConnection,
} from '@/stores/connection/useConnectionStore.types';

function robot(id: string, status: RobotConnection['status']): RobotConnection {
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

function state(...robots: RobotConnection[]): ConnectionState {
  return { robots: Object.fromEntries(robots.map((r) => [r.id, r])) };
}

describe('selectConnectedCount', () => {
  it('returns 0 for no robots', () => {
    expect(selectConnectedCount(state())).toBe(0);
  });

  it('counts only connected robots, ignoring connecting/error/disconnected', () => {
    const s = state(
      robot('a', 'connected'),
      robot('b', 'connecting'),
      robot('c', 'error'),
      robot('d', 'disconnected'),
      robot('e', 'connected'),
    );
    expect(selectConnectedCount(s)).toBe(2);
  });
});

describe('formatConnectionSummary', () => {
  it('renders the empty state', () => {
    expect(formatConnectionSummary(0)).toBe('No robots connected');
  });

  it('renders the singular state', () => {
    expect(formatConnectionSummary(1)).toBe('1 robot connected');
  });

  it('renders the plural state', () => {
    expect(formatConnectionSummary(3)).toBe('3 robots connected');
  });
});
