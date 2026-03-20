import type { DashboardMode } from '../../types/panel-system.types';

export interface PanelPickerProps {
  mode: DashboardMode;
  onAddPanel: (widgetId: string) => void;
  onClose: () => void;
}
