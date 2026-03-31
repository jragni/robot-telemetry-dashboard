import type { ReactNode } from 'react';

export interface PanelConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  topicName?: string;
  content: ReactNode;
  footerActions?: ReactNode;
}

export interface PanelGridProps {
  readonly panels: PanelConfig[];
  readonly gridCols: string;
  readonly onMinimize: (id: string) => void;
}
