import type {
  GridItemLayout,
  LayoutState,
  PanelInstance,
  PersistedViewLayout,
  ViewId,
} from './panel.types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build a PanelInstance with a deterministic id derived from the view and
 * panel type so ids are stable across sessions and predictable in tests.
 */
function makeInstance(
  viewId: ViewId,
  type: PanelInstance['type']
): PanelInstance {
  return { id: `default-${viewId}-${type}`, type };
}

/**
 * Build a GridItemLayout entry. `i` must match the corresponding
 * PanelInstance id.
 */
function makeItem(
  i: string,
  x: number,
  y: number,
  w: number,
  h: number
): GridItemLayout {
  return { i, x, y, w, h };
}

// ---------------------------------------------------------------------------
// Dashboard view
// ---------------------------------------------------------------------------
// lg (12 cols): VideoFeed(0,0,6,8), LidarView(6,0,6,8),
//               ImuDisplay(0,8,4,6), ConnectionStatus(4,8,4,6), TopicList(8,8,4,6)
// md (10 cols): reflow to narrower two-column arrangement
// sm (6 cols):  single-column stacked
// ---------------------------------------------------------------------------

const dashboardPanels: PanelInstance[] = [
  makeInstance('dashboard', 'video-feed'),
  makeInstance('dashboard', 'lidar-view'),
  makeInstance('dashboard', 'imu-display'),
  makeInstance('dashboard', 'connection-status'),
  makeInstance('dashboard', 'topic-list'),
];

const [dvf, dlv, dim, dcs, dtl] = dashboardPanels.map((p) => p.id) as [
  string,
  string,
  string,
  string,
  string,
];

const dashboardLayout: PersistedViewLayout = {
  panels: dashboardPanels,
  breakpoints: {
    lg: [
      makeItem(dvf, 0, 0, 6, 8),
      makeItem(dlv, 6, 0, 6, 8),
      makeItem(dim, 0, 8, 4, 6),
      makeItem(dcs, 4, 8, 4, 6),
      makeItem(dtl, 8, 8, 4, 6),
    ],
    md: [
      makeItem(dvf, 0, 0, 5, 7),
      makeItem(dlv, 5, 0, 5, 7),
      makeItem(dim, 0, 7, 4, 6),
      makeItem(dcs, 4, 7, 3, 6),
      makeItem(dtl, 7, 7, 3, 6),
    ],
    sm: [
      makeItem(dvf, 0, 0, 6, 6),
      makeItem(dlv, 0, 6, 6, 6),
      makeItem(dim, 0, 12, 6, 5),
      makeItem(dcs, 0, 17, 6, 4),
      makeItem(dtl, 0, 21, 6, 5),
    ],
  },
};

// ---------------------------------------------------------------------------
// Fleet view
// ---------------------------------------------------------------------------
// lg (12 cols): ConnectionStatus(0,0,12,4), TopicList(0,4,6,8), ImuDisplay(6,4,6,8)
// ---------------------------------------------------------------------------

const fleetPanels: PanelInstance[] = [
  makeInstance('fleet', 'connection-status'),
  makeInstance('fleet', 'topic-list'),
  makeInstance('fleet', 'imu-display'),
];

const [fcs, ftl, fim] = fleetPanels.map((p) => p.id) as [
  string,
  string,
  string,
];

const fleetLayout: PersistedViewLayout = {
  panels: fleetPanels,
  breakpoints: {
    lg: [
      makeItem(fcs, 0, 0, 12, 4),
      makeItem(ftl, 0, 4, 6, 8),
      makeItem(fim, 6, 4, 6, 8),
    ],
    md: [
      makeItem(fcs, 0, 0, 10, 4),
      makeItem(ftl, 0, 4, 5, 8),
      makeItem(fim, 5, 4, 5, 8),
    ],
    sm: [
      makeItem(fcs, 0, 0, 6, 4),
      makeItem(ftl, 0, 4, 6, 7),
      makeItem(fim, 0, 11, 6, 7),
    ],
  },
};

// ---------------------------------------------------------------------------
// Map view
// ---------------------------------------------------------------------------
// lg (12 cols): MapView(0,0,9,14), ConnectionStatus(9,0,3,4), TopicList(9,4,3,10)
// ---------------------------------------------------------------------------

const mapPanels: PanelInstance[] = [
  makeInstance('map', 'map-view'),
  makeInstance('map', 'connection-status'),
  makeInstance('map', 'topic-list'),
];

const [mmv, mcs, mtl] = mapPanels.map((p) => p.id) as [string, string, string];

const mapLayout: PersistedViewLayout = {
  panels: mapPanels,
  breakpoints: {
    lg: [
      makeItem(mmv, 0, 0, 9, 14),
      makeItem(mcs, 9, 0, 3, 4),
      makeItem(mtl, 9, 4, 3, 10),
    ],
    md: [
      makeItem(mmv, 0, 0, 7, 12),
      makeItem(mcs, 7, 0, 3, 4),
      makeItem(mtl, 7, 4, 3, 8),
    ],
    sm: [
      makeItem(mmv, 0, 0, 6, 10),
      makeItem(mcs, 0, 10, 6, 4),
      makeItem(mtl, 0, 14, 6, 7),
    ],
  },
};

// ---------------------------------------------------------------------------
// Pilot view
// ---------------------------------------------------------------------------
// lg (12 cols): VideoFeed(0,0,8,12), LidarView(8,0,4,6), ControlPad(8,6,4,6)
// ---------------------------------------------------------------------------

const pilotPanels: PanelInstance[] = [
  makeInstance('pilot', 'video-feed'),
  makeInstance('pilot', 'lidar-view'),
  makeInstance('pilot', 'control-pad'),
];

const [pvf, plv, pcp] = pilotPanels.map((p) => p.id) as [
  string,
  string,
  string,
];

const pilotLayout: PersistedViewLayout = {
  panels: pilotPanels,
  breakpoints: {
    lg: [
      makeItem(pvf, 0, 0, 8, 12),
      makeItem(plv, 8, 0, 4, 6),
      makeItem(pcp, 8, 6, 4, 6),
    ],
    md: [
      makeItem(pvf, 0, 0, 6, 10),
      makeItem(plv, 6, 0, 4, 5),
      makeItem(pcp, 6, 5, 4, 5),
    ],
    sm: [
      makeItem(pvf, 0, 0, 6, 8),
      makeItem(plv, 0, 8, 6, 6),
      makeItem(pcp, 0, 14, 6, 6),
    ],
  },
};

// ---------------------------------------------------------------------------
// Exported constant
// ---------------------------------------------------------------------------

export const DEFAULT_LAYOUTS: LayoutState = {
  dashboard: dashboardLayout,
  fleet: fleetLayout,
  map: mapLayout,
  pilot: pilotLayout,
};

// ---------------------------------------------------------------------------
// Deep-copy factories
// ---------------------------------------------------------------------------

/**
 * Overload 1: Called with no arguments — returns a deep copy of the full
 * {@link LayoutState} (all four views).  Used by the layout store for
 * initialisation and full resets.
 */
export function createDefaultLayout(): LayoutState;

/**
 * Overload 2: Called with a `viewId` — returns a deep copy of the default
 * {@link PersistedViewLayout} for that view only.  Used by tests and by
 * single-view reset logic.
 */
export function createDefaultLayout(viewId: ViewId): PersistedViewLayout;

/**
 * Implementation — handles both overloads.
 */
export function createDefaultLayout(
  viewId?: ViewId
): LayoutState | PersistedViewLayout {
  if (viewId === undefined) {
    return structuredClone(DEFAULT_LAYOUTS);
  }
  return structuredClone(DEFAULT_LAYOUTS[viewId]);
}

/**
 * Alias for the single-view overload of {@link createDefaultLayout}.
 * Provided for compatibility with callers that prefer the more descriptive
 * name.
 */
export function createDefaultViewLayout(viewId: ViewId): PersistedViewLayout {
  return createDefaultLayout(viewId);
}
