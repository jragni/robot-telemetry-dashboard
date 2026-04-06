import type { Ros } from 'roslib';

import type { RobotConnection } from '@/stores/connection/useConnectionStore.types';
import type { PanelId } from '@/types/panel.types';
import type { MobileDataPanelId } from '@/features/workspace/types/RobotWorkspaceMobile.types';

export interface ActivePanelContentProps {
  readonly activePanel: MobileDataPanelId;
  readonly connected: boolean;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
  readonly robot: RobotConnection;
  readonly ros: Ros | undefined;
  readonly selectedTopics: Partial<Record<PanelId, string>>;
}
