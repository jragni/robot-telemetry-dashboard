import { describe, expect, it } from 'vitest';

import { formatConnectionSummary, selectConnectedCount } from './StatusBar.helpers';
import { makeRobot } from '@/test-utils/makeRobot';
import type {
  ConnectionState,
  RobotConnection,
} from '@/stores/connection/useConnectionStore.types';

function state(...robots: RobotConnection[]): ConnectionState {
  return { robots: Object.fromEntries(robots.map((r) => [r.id, r])) };
}

describe('selectConnectedCount', () => {
  it('returns 0 for no robots', () => {
    expect(selectConnectedCount(state())).toBe(0);
  });

  it('counts only connected robots, ignoring connecting/error/disconnected', () => {
    const s = state(
      makeRobot('a', 'connected'),
      makeRobot('b', 'connecting'),
      makeRobot('c', 'error'),
      makeRobot('d', 'disconnected'),
      makeRobot('e', 'connected'),
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

  it('renders the plural state at the singular→plural boundary', () => {
    expect(formatConnectionSummary(2)).toBe('2 robots connected');
  });

  it('renders the plural state for larger counts', () => {
    expect(formatConnectionSummary(3)).toBe('3 robots connected');
  });
});
