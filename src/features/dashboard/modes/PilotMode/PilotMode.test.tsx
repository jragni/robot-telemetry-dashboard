import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DEFAULT_LAYOUTS } from '../../registry/defaultLayouts';
import { useLayoutStore } from '../../stores/layoutStore';

import { PilotMode } from './PilotMode';

vi.mock('../../stores/layoutStore', () => ({
  useLayoutStore: vi.fn(),
}));

vi.mock('react-grid-layout', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-grid-layout">{children}</div>
  )),
  WidthProvider: (Component: React.ComponentType) => Component,
}));

// Mock ROSLIB and registry to prevent real WebSocket connections in tests
vi.mock('roslib', () => ({
  default: {
    Ros: class MockRos {
      isConnected = false;
      connect() {
        /* noop */
      }
      close() {
        /* noop */
      }
      on() {
        /* noop */
      }
      off() {
        /* noop */
      }
      removeAllListeners() {
        /* noop */
      }
      getTopics() {
        /* noop */
      }
    },
    Topic: class MockTopic {
      name = '';
      messageType = '';
      constructor() {
        /* noop */
      }
      advertise() {
        /* noop */
      }
      unadvertise() {
        /* noop */
      }
      publish() {
        /* noop */
      }
      subscribe() {
        /* noop */
      }
      unsubscribe() {
        /* noop */
      }
    },
  },
}));

vi.mock('@/services/ros/registry/RosServiceRegistry', () => {
  const mockRos = {
    isConnected: false,
    connect: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    removeAllListeners: vi.fn(),
    getTopics: vi.fn(),
  };
  const mockTransport = {
    robotId: 'robot-1',
    url: '',
    connectionState$: { getValue: () => 'disconnected' },
    connect: vi.fn(),
    disconnect: vi.fn(),
    destroy: vi.fn(),
    getRos: () => mockRos,
  };
  return {
    rosServiceRegistry: {
      get: vi.fn(() => mockTransport),
      destroy: vi.fn(),
      destroyAll: vi.fn(),
    },
  };
});

vi.mock('@/shared/stores/ros/ros.store', () => {
  const storeState = {
    connectionStates: {},
    setConnectionState: () => undefined,
    setConnectionError: () => undefined,
    getConnectionState: () => ({ state: 'disconnected', error: null }),
    removeRobot: () => undefined,
  };
  const useRosStore = Object.assign(
    (selector: (state: typeof storeState) => unknown) => selector(storeState),
    {
      subscribe: () => () => undefined,
      getState: () => storeState,
      setState: () => undefined,
    }
  );
  return { useRosStore };
});

const mockSaveLayout = vi.fn();
const mockResetLayout = vi.fn();

function makeMockStore() {
  return {
    layouts: {
      pilot: DEFAULT_LAYOUTS.pilot,
      dashboard: DEFAULT_LAYOUTS.dashboard,
      engineer: DEFAULT_LAYOUTS.engineer,
    },
    skipNextSaveRef: { current: false },
    saveLayout: mockSaveLayout,
    resetLayout: mockResetLayout,
    getLayout: (mode: string) => DEFAULT_LAYOUTS[mode as 'pilot'] ?? [],
    hydrateFromStorage: vi.fn(),
  };
}

describe('PilotMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLayoutStore).mockReturnValue(makeMockStore());
  });

  it('renders without crashing', () => {
    render(<PilotMode robotId="robot-1" />);
  });

  it('renders the video panel full-width at the top', () => {
    render(<PilotMode robotId="robot-1" />);
    expect(screen.getByTestId('panel-video')).toBeInTheDocument();
  });

  it('renders the controls panel below the video', () => {
    render(<PilotMode robotId="robot-1" />);
    // BUG-003 fix: panel ID is now 'robot-controls' (aligned with registry)
    expect(screen.getByTestId('panel-robot-controls')).toBeInTheDocument();
  });

  it('renders default bottom row panels: IMU, data-plot, topic-list', () => {
    render(<PilotMode robotId="robot-1" />);
    expect(screen.getByTestId('panel-imu')).toBeInTheDocument();
    expect(screen.getByTestId('panel-data-plot')).toBeInTheDocument();
    expect(screen.getByTestId('panel-topic-list')).toBeInTheDocument();
  });

  it('video panel does not have a close button (sovereign)', () => {
    render(<PilotMode robotId="robot-1" />);
    const videoPanel = screen.getByTestId('panel-video');
    expect(
      videoPanel.querySelector('[aria-label="Close panel"]')
    ).not.toBeInTheDocument();
  });

  it('controls panel does not have a close button (fixed)', () => {
    render(<PilotMode robotId="robot-1" />);
    // BUG-003 fix: correct panel ID
    const controlsPanel = screen.getByTestId('panel-robot-controls');
    expect(
      controlsPanel.querySelector('[aria-label="Close panel"]')
    ).not.toBeInTheDocument();
  });

  it('bottom row panels have close buttons', () => {
    render(<PilotMode robotId="robot-1" />);
    const imuPanel = screen.getByTestId('panel-imu');
    expect(
      imuPanel.querySelector('[aria-label="Close panel"]')
    ).toBeInTheDocument();
  });

  it('bottom row panels have drag handles (reorderable)', () => {
    render(<PilotMode robotId="robot-1" />);
    // At minimum the bottom row panels should have drag handles
    const dragHandles = screen.getAllByTestId('drag-handle');
    expect(dragHandles.length).toBeGreaterThanOrEqual(3);
  });

  it('renders [+] button at end of bottom row', () => {
    render(<PilotMode robotId="robot-1" />);
    expect(
      screen.getByRole('button', { name: /add panel/i })
    ).toBeInTheDocument();
  });

  // ── Mobile ──────────────────────────────────────────────────────────────

  it('mobile: renders video at top', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    expect(screen.getByTestId('pilot-mobile-video')).toBeInTheDocument();
  });

  it('mobile: renders instrument strip below video', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    expect(screen.getByTestId('pilot-instrument-strip')).toBeInTheDocument();
  });

  it('mobile: renders virtual D-pad controls', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    expect(screen.getByTestId('pilot-dpad')).toBeInTheDocument();
  });

  it('mobile: D-pad direction buttons are present and interactive (BUG-004 fix)', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    // BUG-004 fix: real ControlPad with actual event handlers (not inert buttons)
    expect(
      screen.getByRole('button', { name: /forward/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /backward/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /left/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /right/i })).toBeInTheDocument();
  });

  // ── Fix 1: Swipeable carousel (replaces old overflow div) ────────────────

  it('mobile: renders swipeable carousel (not old overflow div)', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    expect(screen.getByTestId('pilot-mobile-carousel')).toBeInTheDocument();
    // Old div should NOT be present once carousel is implemented
    expect(
      screen.queryByTestId('pilot-swipeable-cards')
    ).not.toBeInTheDocument();
  });

  it('mobile: carousel dot indicators render', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    expect(
      screen.getByTestId('pilot-mobile-carousel-dots')
    ).toBeInTheDocument();
  });

  it('mobile: carousel has at least 2 card items', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    // Cards are indexed 0..n
    expect(screen.getByTestId('pilot-mobile-card-0')).toBeInTheDocument();
    expect(screen.getByTestId('pilot-mobile-card-1')).toBeInTheDocument();
  });

  it('mobile: dot count matches card count', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    const dots = screen.getAllByTestId(/^pilot-mobile-dot-\d+$/);
    const cards = screen.getAllByTestId(/^pilot-mobile-card-\d+$/);
    expect(dots.length).toBe(cards.length);
  });

  it('mobile: drag handles are not visible', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    expect(screen.queryByTestId('drag-handle')).not.toBeInTheDocument();
  });
});
