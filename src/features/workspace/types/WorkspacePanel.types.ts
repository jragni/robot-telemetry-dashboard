import type { ReactNode } from 'react';

export interface WorkspacePanelProps {
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly topicName?: string;
  readonly headerActions?: ReactNode;
  readonly footerActions?: ReactNode;
  readonly onMinimize?: () => void;
  readonly children: ReactNode;
}
