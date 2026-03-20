import type { PanelContentProps } from '../types/panel-system.types';

import { TopicListWidget } from '@/features/telemetry/components/TopicListWidget/TopicListWidget';

export function TopicListWidgetPanel({
  panelId,
  robotId = '',
}: PanelContentProps) {
  return <TopicListWidget panelId={panelId} robotId={robotId} />;
}
