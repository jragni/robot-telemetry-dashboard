import type { LayoutItem } from 'react-grid-layout';

export type DashboardMode = 'dashboard' | 'pilot' | 'engineer';

export interface PanelContentProps {
  panelId: string;
  robotId?: string;
}

export interface PanelRegistryEntry {
  widgetId: string;
  label: string;
  description: string;
  component: React.ComponentType<PanelContentProps>;
  availableInModes: DashboardMode[];
  defaultSize: { w: number; h: number };
  minSize: { w: number; h: number };
  isSovereign?: boolean;
}

export interface PanelTabConfig {
  widgetId: string;
  label: string;
  robotId: string;
  content: React.ReactNode;
}

export interface TabGroupConfig {
  panelId: string;
  tabs: PanelTabConfig[];
}

export type ModeLayouts = Record<DashboardMode, readonly LayoutItem[]>;
