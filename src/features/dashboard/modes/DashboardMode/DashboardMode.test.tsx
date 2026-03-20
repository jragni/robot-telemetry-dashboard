import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DEFAULT_LAYOUTS } from '../../registry/defaultLayouts';
import { useLayoutStore } from '../../stores/layoutStore';

import { DashboardMode } from './DashboardMode';

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
      dashboard: DEFAULT_LAYOUTS.dashboard,
      pilot: DEFAULT_LAYOUTS.pilot,
      engineer: DEFAULT_LAYOUTS.engineer,
    },
    skipNextSaveRef: { current: false },
    saveLayout: mockSaveLayout,
    resetLayout: mockResetLayout,
    getLayout: (mode: string) => DEFAULT_LAYOUTS[mode as 'dashboard'] ?? [],
    hydrateFromStorage: vi.fn(),
  };
}

describe('DashboardMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLayoutStore).mockReturnValue(makeMockStore());
  });

  it('renders without crashing', () => {
    render(<DashboardMode />);
  });

  it('renders map panel', () => {
    render(<DashboardMode />);
    expect(screen.getByTestId('panel-map')).toBeInTheDocument();
  });

  it('renders video-pip-1 panel', () => {
    render(<DashboardMode />);
    expect(screen.getByTestId('panel-video-pip-1')).toBeInTheDocument();
  });

  it('renders fleet-status panel', () => {
    render(<DashboardMode />);
    expect(screen.getByTestId('panel-fleet-status')).toBeInTheDocument();
  });

  it('renders video-pip-2 panel', () => {
    render(<DashboardMode />);
    expect(screen.getByTestId('panel-video-pip-2')).toBeInTheDocument();
  });

  it('renders alerts panel', () => {
    render(<DashboardMode />);
    expect(screen.getByTestId('panel-alerts')).toBeInTheDocument();
  });

  it('map panel does not have a close button (sovereign)', () => {
    render(<DashboardMode />);
    const mapPanel = screen.getByTestId('panel-map');
    expect(
      mapPanel.querySelector('[aria-label="Close panel"]')
    ).not.toBeInTheDocument();
  });

  it('video-pip-1 panel has a close button (closable)', () => {
    render(<DashboardMode />);
    const pipPanel = screen.getByTestId('panel-video-pip-1');
    expect(
      pipPanel.querySelector('[aria-label="Close panel"]')
    ).toBeInTheDocument();
  });

  it('fleet-status panel does not have a close button (not closable)', () => {
    render(<DashboardMode />);
    const panel = screen.getByTestId('panel-fleet-status');
    expect(
      panel.querySelector('[aria-label="Close panel"]')
    ).not.toBeInTheDocument();
  });

  it('drag handles are NOT rendered (no drag in Dashboard mode)', () => {
    render(<DashboardMode />);
    expect(screen.queryByTestId('drag-handle')).not.toBeInTheDocument();
  });

  it('renders [+] button to add a video PIP slot', () => {
    render(<DashboardMode />);
    expect(
      screen.getByRole('button', { name: /add video/i })
    ).toBeInTheDocument();
  });

  it('mobile (375px): renders in single-column stacked layout', () => {
    render(<DashboardMode isMobile={true} />);
    expect(screen.getByTestId('dashboard-mobile-layout')).toBeInTheDocument();
  });

  it('mobile: drag handles are not visible', () => {
    render(<DashboardMode isMobile={true} />);
    expect(screen.queryByTestId('drag-handle')).not.toBeInTheDocument();
  });
});
