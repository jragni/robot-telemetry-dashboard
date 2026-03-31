import type { ReactNode } from 'react';

export interface TopicSelectorProps {
  readonly topicName: string;
}

export interface WorkspacePanelProps {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly topicName?: string;
  readonly headerActions?: ReactNode;
  readonly onMinimize?: () => void;
  readonly onMaximize?: () => void;
  readonly onRestoreAll?: () => void;
  readonly maximized?: boolean;
  readonly children: ReactNode;
}
