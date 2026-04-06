import type { ComponentType, ReactNode } from 'react';

import type { RosTopic } from '@/hooks';

export interface WorkspacePanelProps {
  readonly label: string;
  readonly icon: ComponentType<{ className?: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- panels have different prop shapes, type safety is at the call site
  readonly Component: ComponentType<any>;
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
