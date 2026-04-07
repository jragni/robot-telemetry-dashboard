import type { LucideIcon } from 'lucide-react';
import type { Ros } from 'roslib';

import type { RosTopic } from '@/hooks';
import type { RobotConnection } from '@/stores/connection/useConnectionStore.types';
import type { PanelId } from '@/types/panel.types';

import type {
  MobileDataPanelId,
  MobileTabId,
} from '@/features/workspace/types/RobotWorkspaceMobile.types';
import type { FilteredTopics } from '@/features/workspace/hooks/useTopicManager.types';

export interface RobotWorkspaceMobileProps {
  readonly connected: boolean;
  readonly filteredTopics: FilteredTopics;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
  readonly onTopicChange: (panelId: PanelId, topicName: string) => void;
  readonly robot: RobotConnection;
  readonly ros: Ros | undefined;
  readonly selectedTopics: Partial<Record<PanelId, string>>;
}

export interface MobilePanelHeaderProps {
  readonly activeFilteredTopics: readonly RosTopic[];
  readonly activeLabel: string;
  readonly activePanel: MobileDataPanelId;
  readonly activeTopicName: string | undefined;
  readonly icon: LucideIcon | undefined;
  readonly onTopicChange: (panelId: PanelId, topicName: string) => void;
  readonly showTopicSelector: boolean;
}

export interface MobileTabBarProps {
  readonly activePanel: MobileDataPanelId;
  readonly onTabPress: (tabId: MobileTabId) => void;
}
