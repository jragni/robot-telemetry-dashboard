import type { PanelContentProps } from '../types/panel-system.types';

import { LidarWidget } from '@/features/telemetry/components/LidarWidget/LidarWidget';

export function LidarWidgetPanel({ panelId, robotId = '' }: PanelContentProps) {
  return <LidarWidget panelId={panelId} robotId={robotId} topicName="/scan" />;
}
