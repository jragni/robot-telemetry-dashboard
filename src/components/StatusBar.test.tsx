import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { makeRobot } from '@/test-utils/makeRobot';
import type {
  ConnectionState,
  RobotConnection,
} from '@/stores/connection/useConnectionStore.types';

let mockState: ConnectionState;

// The connection store persists to localStorage, which is unavailable in this test
// env (storage.setItem missing) and is bound at module import — too early to polyfill
// here. So we mock the hook to apply the REAL selectConnectedCount to a controlled
// state: this genuinely exercises StatusBar's selector -> copy -> render wiring.
// Out of scope (covered by the store's own suite): Zustand subscription/equality
// semantics — the selector returns a primitive, so re-renders track the count value.
vi.mock('@/stores/connection/useConnectionStore', () => ({
  useConnectionStore: (selector: (s: ConnectionState) => unknown) => selector(mockState),
}));

import { StatusBar } from './StatusBar';

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

  it('renders the summary as the footer status line with no topics/latency segment', () => {
    render(<StatusBar />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveTextContent('No robots connected');
    expect(footer).not.toHaveTextContent(/topics/);
    expect(footer).not.toHaveTextContent(/ms/);
  });

  it('counts a single connected robot', () => {
    seed(makeRobot('a', 'connected'));
    render(<StatusBar />);
    expect(screen.getByText('1 robot connected')).toBeInTheDocument();
  });

  it('counts multiple connected robots and ignores non-connected states', () => {
    seed(
      makeRobot('a', 'connected'),
      makeRobot('b', 'connected'),
      makeRobot('c', 'connecting'),
      makeRobot('d', 'error'),
    );
    render(<StatusBar />);
    expect(screen.getByText('2 robots connected')).toBeInTheDocument();
  });

  it('treats connecting-only as no connection', () => {
    seed(makeRobot('a', 'connecting'));
    render(<StatusBar />);
    expect(screen.getByText('No robots connected')).toBeInTheDocument();
  });

  it('treats error-only as no connection', () => {
    seed(makeRobot('a', 'error'), makeRobot('b', 'disconnected'));
    render(<StatusBar />);
    expect(screen.getByText('No robots connected')).toBeInTheDocument();
  });
});
