import type { PanelTabConfig } from '../../types/panel-system.types';

export interface TabGroupProps {
  panelId: string;
  tabs: PanelTabConfig[];
  onRemoveTab: (panelId: string, widgetId: string) => void;
  onAddTab?: () => void;
}
