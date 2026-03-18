import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useLayoutStore } from './layout.store';

// ---------------------------------------------------------------------------
// Mock panel defaults — shape matches the real panel.defaults.ts exports
// ---------------------------------------------------------------------------

vi.mock('@/features/panels/panel.defaults', () => ({
  createDefaultLayout: vi.fn(() => ({
    dashboard: {
      breakpoints: {
        lg: [{ i: 'p1', x: 0, y: 0, w: 4, h: 4 }],
        md: [],
        sm: [],
      },
      panels: [{ id: 'p1', type: 'video-feed' }],
    },
    fleet: { breakpoints: { lg: [], md: [], sm: [] }, panels: [] },
    map: { breakpoints: { lg: [], md: [], sm: [] }, panels: [] },
    pilot: { breakpoints: { lg: [], md: [], sm: [] }, panels: [] },
  })),
  createDefaultViewLayout: vi.fn((_viewId: string) => ({
    breakpoints: { lg: [], md: [], sm: [] },
    panels: [],
  })),
}));

// ---------------------------------------------------------------------------
// Mock panel registry — shape matches real PANEL_REGISTRY entries
// ---------------------------------------------------------------------------

vi.mock('@/features/panels/panel.registry', () => ({
  PANEL_REGISTRY: {
    'video-feed': { defaultSize: { w: 4, h: 4, minW: 2, minH: 2 } },
    'telemetry-chart': { defaultSize: { w: 6, h: 3, minW: 3, minH: 2 } },
    'robot-map': { defaultSize: { w: 8, h: 6, minW: 4, minH: 3 } },
    'battery-status': { defaultSize: { w: 3, h: 2, minW: 2, minH: 2 } },
  },
  getPanelMeta: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VIEW_IDS = ['dashboard', 'fleet', 'map', 'pilot'] as const;

function resetStore() {
  useLayoutStore.setState({
    layouts: {
      dashboard: {
        breakpoints: {
          lg: [{ i: 'p1', x: 0, y: 0, w: 4, h: 4 }],
          md: [],
          sm: [],
        },
        panels: [{ id: 'p1', type: 'video-feed' }],
      },
      fleet: { breakpoints: { lg: [], md: [], sm: [] }, panels: [] },
      map: { breakpoints: { lg: [], md: [], sm: [] }, panels: [] },
      pilot: { breakpoints: { lg: [], md: [], sm: [] }, panels: [] },
    },
  });

  localStorage.clear();
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('layout store', () => {
  beforeEach(() => {
    resetStore();
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  describe('initial state', () => {
    it('has layouts for all 4 view IDs', () => {
      const { layouts } = useLayoutStore.getState();

      for (const viewId of VIEW_IDS) {
        expect(layouts[viewId]).toBeDefined();
        expect(layouts[viewId].breakpoints).toBeDefined();
        expect(layouts[viewId].panels).toBeDefined();
      }
    });
  });

  // -------------------------------------------------------------------------
  // setBreakpointLayouts
  // -------------------------------------------------------------------------

  describe('setBreakpointLayouts', () => {
    it('updates lg breakpoint for dashboard without touching md/sm', () => {
      const newLg = [{ i: 'p1', x: 2, y: 0, w: 6, h: 4 }];

      useLayoutStore.getState().setBreakpointLayouts('dashboard', 'lg', newLg);

      const { layouts } = useLayoutStore.getState();
      expect(layouts.dashboard.breakpoints.lg).toEqual(newLg);
      expect(layouts.dashboard.breakpoints.md).toEqual([]);
      expect(layouts.dashboard.breakpoints.sm).toEqual([]);
    });

    it('updates md breakpoint without touching lg/sm', () => {
      const newMd = [{ i: 'p1', x: 0, y: 0, w: 3, h: 3 }];

      useLayoutStore.getState().setBreakpointLayouts('dashboard', 'md', newMd);

      const { layouts } = useLayoutStore.getState();
      // lg is unchanged — still has the original p1 item from the reset state
      expect(layouts.dashboard.breakpoints.lg).toEqual([
        { i: 'p1', x: 0, y: 0, w: 4, h: 4 },
      ]);
      expect(layouts.dashboard.breakpoints.md).toEqual(newMd);
      expect(layouts.dashboard.breakpoints.sm).toEqual([]);
    });

    it('does not affect other views', () => {
      const newLg = [{ i: 'p1', x: 2, y: 0, w: 6, h: 4 }];

      useLayoutStore.getState().setBreakpointLayouts('dashboard', 'lg', newLg);

      const { layouts } = useLayoutStore.getState();
      expect(layouts.fleet.breakpoints.lg).toEqual([]);
      expect(layouts.map.breakpoints.lg).toEqual([]);
      expect(layouts.pilot.breakpoints.lg).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // addPanel
  // -------------------------------------------------------------------------

  describe('addPanel', () => {
    it('adds a PanelInstance to the view panels array', () => {
      useLayoutStore.getState().addPanel('fleet', 'video-feed');

      const { layouts } = useLayoutStore.getState();
      expect(layouts.fleet.panels).toHaveLength(1);
      expect(layouts.fleet.panels[0].type).toBe('video-feed');
    });

    it('adds a GridItemLayout entry to all 3 breakpoints', () => {
      useLayoutStore.getState().addPanel('fleet', 'video-feed');

      const { layouts } = useLayoutStore.getState();
      const { lg, md, sm } = layouts.fleet.breakpoints;

      expect(lg).toHaveLength(1);
      expect(md).toHaveLength(1);
      expect(sm).toHaveLength(1);
    });

    it('generates a unique id for the panel', () => {
      useLayoutStore.getState().addPanel('fleet', 'video-feed');
      useLayoutStore.getState().addPanel('fleet', 'video-feed');

      const { layouts } = useLayoutStore.getState();
      const ids = layouts.fleet.panels.map((p) => p.id);

      expect(ids).toHaveLength(2);
      expect(ids[0]).not.toBe(ids[1]);
      expect(typeof ids[0]).toBe('string');
      expect(ids[0].length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // removePanel
  // -------------------------------------------------------------------------

  describe('removePanel', () => {
    it('removes panel from panels array', () => {
      useLayoutStore.getState().addPanel('fleet', 'video-feed');

      const panelId = useLayoutStore.getState().layouts.fleet.panels[0].id;
      useLayoutStore.getState().removePanel('fleet', panelId);

      expect(useLayoutStore.getState().layouts.fleet.panels).toHaveLength(0);
    });

    it('removes layout item from all 3 breakpoints matching i === panelId', () => {
      useLayoutStore.getState().addPanel('fleet', 'video-feed');

      const panelId = useLayoutStore.getState().layouts.fleet.panels[0].id;
      useLayoutStore.getState().removePanel('fleet', panelId);

      const { lg, md, sm } =
        useLayoutStore.getState().layouts.fleet.breakpoints;
      expect(lg.find((item) => item.i === panelId)).toBeUndefined();
      expect(md.find((item) => item.i === panelId)).toBeUndefined();
      expect(sm.find((item) => item.i === panelId)).toBeUndefined();
    });

    it('is a no-op for unknown panelId', () => {
      useLayoutStore.getState().addPanel('fleet', 'video-feed');

      const before = useLayoutStore.getState().layouts.fleet.panels.length;
      useLayoutStore.getState().removePanel('fleet', 'non-existent-id');

      expect(useLayoutStore.getState().layouts.fleet.panels).toHaveLength(
        before
      );
    });
  });

  // -------------------------------------------------------------------------
  // resetLayout
  // -------------------------------------------------------------------------

  describe('resetLayout', () => {
    it('calls createDefaultViewLayout and replaces the view layout', async () => {
      const { createDefaultViewLayout } =
        await import('@/features/panels/panel.defaults');
      const mockedCreate = vi.mocked(createDefaultViewLayout);
      mockedCreate.mockReturnValueOnce({
        breakpoints: {
          lg: [{ i: 'reset-item', x: 0, y: 0, w: 2, h: 2 }],
          md: [],
          sm: [],
        },
        panels: [],
      });

      useLayoutStore.getState().resetLayout('fleet');

      expect(mockedCreate).toHaveBeenCalledWith('fleet');

      const { layouts } = useLayoutStore.getState();
      expect(layouts.fleet.breakpoints.lg).toEqual([
        { i: 'reset-item', x: 0, y: 0, w: 2, h: 2 },
      ]);
    });

    it('does not affect other views', async () => {
      const { createDefaultViewLayout } =
        await import('@/features/panels/panel.defaults');
      vi.mocked(createDefaultViewLayout).mockReturnValueOnce({
        breakpoints: { lg: [], md: [], sm: [] },
        panels: [],
      });

      // Verify dashboard has its original item before reset
      const dashboardBefore =
        useLayoutStore.getState().layouts.dashboard.breakpoints.lg;
      expect(dashboardBefore).toEqual([{ i: 'p1', x: 0, y: 0, w: 4, h: 4 }]);

      useLayoutStore.getState().resetLayout('fleet');

      // Dashboard should still have its original item after fleet reset
      const dashboardAfter =
        useLayoutStore.getState().layouts.dashboard.breakpoints.lg;
      expect(dashboardAfter).toEqual([{ i: 'p1', x: 0, y: 0, w: 4, h: 4 }]);
    });
  });

  // -------------------------------------------------------------------------
  // getViewLayout
  // -------------------------------------------------------------------------

  describe('getViewLayout', () => {
    it('returns the layout for the given viewId', () => {
      const layout = useLayoutStore.getState().getViewLayout('dashboard');

      expect(layout).toBeDefined();
      expect(layout.breakpoints.lg).toEqual([
        { i: 'p1', x: 0, y: 0, w: 4, h: 4 },
      ]);
    });

    it('returns a default layout for unknown viewId (never undefined)', () => {
      const layout = useLayoutStore.getState().getViewLayout('unknown-view');

      expect(layout).toBeDefined();
      expect(layout.breakpoints).toBeDefined();
      expect(layout.panels).toBeDefined();
    });
  });
});
