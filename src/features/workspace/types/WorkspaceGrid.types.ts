import type { ReactNode } from 'react';

export interface PanelConfig {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly topicName?: string;
  readonly content: ReactNode;
  readonly footerActions?: ReactNode;
}

export interface PanelGridProps {
  readonly panels: PanelConfig[];
  readonly gridCols: string;
  readonly onMinimize: (id: string) => void;
}

export interface WorkspaceGridProps {
  readonly panels: PanelConfig[];
}
