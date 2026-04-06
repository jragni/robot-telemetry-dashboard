import type { ComponentType, ReactNode } from 'react';

import type { RosTopic } from '@/hooks';

export interface TopicSelectorProps {
  readonly topicName: string;
  readonly availableTopics?: readonly RosTopic[];
  readonly onTopicChange?: (topicName: string) => void;
}

export interface WorkspacePanelProps {
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
  readonly component: ComponentType<Record<string, unknown>>;
  readonly componentProps: Record<string, unknown>;
  readonly topicName?: string;
  readonly availableTopics?: readonly RosTopic[];
  readonly onTopicChange?: (topicName: string) => void;
  readonly headerActions?: ReactNode;
  readonly onMinimize?: () => void;
  readonly onMaximize?: () => void;
  readonly onRestoreAll?: () => void;
  readonly maximized?: boolean;
}
