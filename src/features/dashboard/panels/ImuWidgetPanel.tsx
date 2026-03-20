import type { PanelContentProps } from '../types/panel-system.types';

import { ImuWidget } from '@/features/telemetry/components/ImuWidget/ImuWidget';

export function ImuWidgetPanel({ panelId, robotId = '' }: PanelContentProps) {
  return (
    <ImuWidget panelId={panelId} robotId={robotId} topicName="/imu/data" />
  );
}
