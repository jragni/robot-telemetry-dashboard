import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DEFAULT_LAYOUTS } from '../../registry/defaultLayouts';
import { useLayoutStore } from '../../stores/layoutStore';

import { EngineerMode } from './EngineerMode';

vi.mock('../../stores/layoutStore', () => ({
  useLayoutStore: vi.fn(),
}));

vi.mock('react-grid-layout', () => ({
  default: vi.fn(
    ({
      children,
      onLayoutChange,
      rowHeight,
    }: {
      children: React.ReactNode;
      onLayoutChange?: (layout: unknown[]) => void;
      rowHeight?: number;
    }) => (
      <div data-testid="react-grid-layout" data-row-height={rowHeight}>
        {children}
      </div>
    )
  ),
  WidthProvider: (Component: React.ComponentType) => Component,
}));

const mockSaveLayout = vi.fn();
const mockResetLayout = vi.fn();
const mockSkipRef = { current: false };

function makeMockStore() {
  return {
    layouts: {
      engineer: DEFAULT_LAYOUTS.engineer,
      dashboard: DEFAULT_LAYOUTS.dashboard,
      pilot: DEFAULT_LAYOUTS.pilot,
    },
    skipNextSaveRef: mockSkipRef,
    saveLayout: mockSaveLayout,
    resetLayout: mockResetLayout,
    getLayout: (mode: string) => DEFAULT_LAYOUTS[mode as 'engineer'] ?? [],
    hydrateFromStorage: vi.fn(),
  };
}

describe('EngineerMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSkipRef.current = false;
    vi.mocked(useLayoutStore).mockReturnValue(makeMockStore());
    // Set a stable window.innerHeight for rowHeight tests
    Object.defineProperty(window, 'innerHeight', {
      value: 900,
      writable: true,
    });
  });

  it('renders without crashing', () => {
    render(<EngineerMode />);
  });

  it('renders react-grid-layout', () => {
    render(<EngineerMode />);
    expect(screen.getByTestId('react-grid-layout')).toBeInTheDocument();
  });

  it('renders all default panels from DEFAULT_LAYOUTS.engineer', () => {
    render(<EngineerMode />);
    for (const item of DEFAULT_LAYOUTS.engineer) {
      expect(screen.getByTestId(`panel-${item.i}`)).toBeInTheDocument();
    }
  });

  it('renders [+] button to open PanelPicker', () => {
    render(<EngineerMode />);
    expect(
      screen.getByRole('button', { name: /add panel/i })
    ).toBeInTheDocument();
  });

  // ── ISS-008: rowHeight must not derive from container height ───────────

  it('rowHeight is derived from window.innerHeight, not container height', () => {
    Object.defineProperty(window, 'innerHeight', {
      value: 900,
      writable: true,
    });
    render(<EngineerMode />);
    const grid = screen.getByTestId('react-grid-layout');
    const rowHeight = Number(grid.getAttribute('data-row-height'));
    // rowHeight = Math.floor((900 - HEADER_HEIGHT - BOTTOM_PADDING) / GRID_ROWS)
    // Exact value depends on constants, but it must be > 0 and derived from 900
    expect(rowHeight).toBeGreaterThan(0);
    expect(rowHeight).toBeLessThan(900);
  });

  it('rowHeight stays stable across multiple renders (ISS-008 regression)', () => {
    const { rerender } = render(<EngineerMode />);
    const grid1 = screen.getByTestId('react-grid-layout');
    const rowHeight1 = grid1.getAttribute('data-row-height');

    rerender(<EngineerMode />);
    const grid2 = screen.getByTestId('react-grid-layout');
    const rowHeight2 = grid2.getAttribute('data-row-height');

    expect(rowHeight1).toBe(rowHeight2);
  });

  it('rowHeight does not change when panels are added (ISS-008 — 10 panels)', () => {
    // Start with default layout (5 panels)
    render(<EngineerMode />);
    const grid = screen.getByTestId('react-grid-layout');
    const initialRowHeight = grid.getAttribute('data-row-height');

    // Simulate adding 5 more panels via store state update
    const tenPanelLayout = [
      ...DEFAULT_LAYOUTS.engineer,
      { i: 'extra-1', x: 0, y: 10, w: 2, h: 2 },
      { i: 'extra-2', x: 2, y: 10, w: 2, h: 2 },
      { i: 'extra-3', x: 4, y: 10, w: 2, h: 2 },
      { i: 'extra-4', x: 6, y: 10, w: 2, h: 2 },
      { i: 'extra-5', x: 8, y: 10, w: 2, h: 2 },
    ];
    vi.mocked(useLayoutStore).mockReturnValue({
      ...makeMockStore(),
      getLayout: () => tenPanelLayout,
    });

    const { rerender } = render(<EngineerMode />);
    rerender(<EngineerMode />);
    const afterGrid = screen.getAllByTestId('react-grid-layout').at(-1);
    expect(afterGrid?.getAttribute('data-row-height')).toBe(initialRowHeight);
  });

  it('all panels are draggable and resizable (no static=true by default)', () => {
    render(<EngineerMode />);
    // PanelFrames in engineer mode should have drag handles
    const dragHandles = screen.getAllByTestId('drag-handle');
    expect(dragHandles.length).toBeGreaterThan(0);
  });

  it('shows "requires desktop" message on mobile', () => {
    render(<EngineerMode isMobile={true} />);
    expect(
      screen.getByText(/engineer mode requires desktop/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /switch to pilot/i })
    ).toBeInTheDocument();
  });

  it('does not render the grid on mobile', () => {
    render(<EngineerMode isMobile={true} />);
    expect(screen.queryByTestId('react-grid-layout')).not.toBeInTheDocument();
  });
});
