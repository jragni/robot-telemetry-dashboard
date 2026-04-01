import type { ReactNode } from 'react';
import type { RosTopic } from '@/hooks/useRosTopics';

export interface TopicSelectorProps {
  readonly topicName: string;
  readonly availableTopics?: readonly RosTopic[];
  readonly onTopicChange?: (topicName: string) => void;
}

export interface WorkspacePanelProps {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly topicName?: string;
  readonly availableTopics?: readonly RosTopic[];
  readonly onTopicChange?: (topicName: string) => void;
  readonly headerActions?: ReactNode;
  readonly onMinimize?: () => void;
  readonly onMaximize?: () => void;
  readonly onRestoreAll?: () => void;
  readonly maximized?: boolean;
  readonly children: ReactNode;
}
