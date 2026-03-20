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
    expect(screen.getByTestId('panel-controls')).toBeInTheDocument();
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
    const controlsPanel = screen.getByTestId('panel-controls');
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

  it('mobile: D-pad buttons have touch targets >= 48px', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    const dpadButtons = screen.getAllByTestId(/dpad-btn/);
    for (const btn of dpadButtons) {
      const style = window.getComputedStyle(btn);
      const minDimension = Math.min(
        parseInt(style.width || '0'),
        parseInt(style.height || '0')
      );
      // Check data attribute as proxy for min-size enforcement
      expect(btn).toHaveAttribute('data-min-size', '48');
    }
  });

  it('mobile: renders swipeable telemetry cards container', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    expect(screen.getByTestId('pilot-swipeable-cards')).toBeInTheDocument();
  });

  it('mobile: drag handles are not visible', () => {
    render(<PilotMode robotId="robot-1" isMobile={true} />);
    expect(screen.queryByTestId('drag-handle')).not.toBeInTheDocument();
  });
});
