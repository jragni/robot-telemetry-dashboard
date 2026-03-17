import type { LucideIcon } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LayoutItem } from 'react-grid-layout';

// ---------------------------------------------------------------------------
// Panel type identifiers
// ---------------------------------------------------------------------------

export type PanelTypeId =
  | 'video-feed'
  | 'lidar-view'
  | 'imu-display'
  | 'control-pad'
  | 'topic-list'
  | 'data-plot'
  | 'depth-camera'
  | 'map-view'
  | 'connection-status';

// ---------------------------------------------------------------------------
// View identifiers
// ---------------------------------------------------------------------------

export type ViewId = 'dashboard' | 'fleet' | 'map' | 'pilot';

// ---------------------------------------------------------------------------
// Panel sizing
// ---------------------------------------------------------------------------

export interface PanelSize {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

// ---------------------------------------------------------------------------
// Panel metadata (registry entry)
// ---------------------------------------------------------------------------

export interface PanelMeta {
  typeId: PanelTypeId;
  title: string;
  description: string;
  defaultSize: PanelSize;
  icon: LucideIcon;
  component: ComponentType<PanelComponentProps>;
}

// ---------------------------------------------------------------------------
// Props passed into every panel component (promoted to shared layer)
// ---------------------------------------------------------------------------

export type { PanelComponentProps } from '@/types/panel.types';

// ---------------------------------------------------------------------------
// Runtime panel instance (placed on a view)
// ---------------------------------------------------------------------------

export interface PanelInstance {
  id: string;
  type: PanelTypeId;
  config?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Grid layout aliases
// ---------------------------------------------------------------------------

export type GridItemLayout = LayoutItem;

export interface BreakpointLayouts {
  lg: GridItemLayout[];
  md: GridItemLayout[];
  sm: GridItemLayout[];
}

// ---------------------------------------------------------------------------
// Persisted layout for a single view
// ---------------------------------------------------------------------------

export interface PersistedViewLayout {
  breakpoints: BreakpointLayouts;
  panels: PanelInstance[];
}

// ---------------------------------------------------------------------------
// Full layout state (one entry per view)
// ---------------------------------------------------------------------------

export type LayoutState = Record<ViewId, PersistedViewLayout>;

// ---------------------------------------------------------------------------
// ViewLayout — alias kept for store / test compatibility
// ---------------------------------------------------------------------------

export type ViewLayout = PersistedViewLayout;
