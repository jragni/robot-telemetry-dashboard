import type { PanelContentProps } from '../types/panel-system.types';

import { DataPlotWidget } from '@/features/telemetry/components/DataPlotWidget/DataPlotWidget';

export function DataPlotWidgetPanel({
  panelId,
  robotId = '',
}: PanelContentProps) {
  return (
    <DataPlotWidget panelId={panelId} robotId={robotId} topicName="/odom" />
  );
}
