import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import type {
  ConnectionState,
  ConnectionStatus,
  RobotConnection,
} from '@/stores/connection/useConnectionStore.types';

let mockState: ConnectionState;

// The connection store persists to localStorage, which is unavailable under this
// test env (storage.setItem missing). Mock the hook to apply the real selector to
// a controlled state — this exercises StatusBar's selector -> render wiring.
vi.mock('@/stores/connection/useConnectionStore', () => ({
  useConnectionStore: (selector: (s: ConnectionState) => unknown) => selector(mockState),
}));

import { StatusBar } from './StatusBar';

function robot(id: string, status: ConnectionStatus): RobotConnection {
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

function seed(...robots: RobotConnection[]): void {
  mockState = { robots: Object.fromEntries(robots.map((r) => [r.id, r])) };
}

describe('StatusBar', () => {
  beforeEach(() => {
    seed();
  });

  it('shows the empty state when no robots are connected', () => {
    render(<StatusBar />);
    expect(screen.getByText('No robots connected')).toBeInTheDocument();
  });

  it('does not render a placeholder topics/latency segment', () => {
    render(<StatusBar />);
    expect(screen.queryByText(/topics/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ms/)).not.toBeInTheDocument();
  });

  it('counts a single connected robot', () => {
    seed(robot('a', 'connected'));
    render(<StatusBar />);
    expect(screen.getByText('1 robot connected')).toBeInTheDocument();
  });

  it('counts multiple connected robots and ignores non-connected states', () => {
    seed(
      robot('a', 'connected'),
      robot('b', 'connected'),
      robot('c', 'connecting'),
      robot('d', 'error'),
    );
    render(<StatusBar />);
    expect(screen.getByText('2 robots connected')).toBeInTheDocument();
  });

  it('treats connecting-only as no connection', () => {
    seed(robot('a', 'connecting'), robot('b', 'error'));
    render(<StatusBar />);
    expect(screen.getByText('No robots connected')).toBeInTheDocument();
  });
});
