import type { PanelContentProps } from '../types/panel-system.types';

import { DepthCameraWidget } from '@/features/telemetry/components/DepthCameraWidget/DepthCameraWidget';

export function DepthCameraWidgetPanel({
  panelId,
  robotId = '',
}: PanelContentProps) {
  return (
    <DepthCameraWidget
      panelId={panelId}
      robotId={robotId}
      topicName="/camera/depth/image_raw"
    />
  );
}
