// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type {
  PanelTypeId,
  ViewId,
  PanelSize,
  PanelMeta,
  PanelComponentProps,
  PanelInstance,
  GridItemLayout,
  BreakpointLayouts,
  PersistedViewLayout,
  LayoutState,
  ViewLayout,
} from './panel.types';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export { PANEL_REGISTRY, getPanelMeta } from './panel.registry';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export {
  DEFAULT_LAYOUTS,
  createDefaultLayout,
  createDefaultViewLayout,
} from './panel.defaults';

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export { AddPanelDialog } from './components/AddPanelDialog';
export { PanelFrame } from './components/PanelFrame';
export { PanelGrid } from './components/PanelGrid';
export { PanelPlaceholder } from './components/PanelPlaceholder';
export { PanelToolbar } from './components/PanelToolbar';
