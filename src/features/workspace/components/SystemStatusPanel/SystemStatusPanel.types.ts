import type { Ros } from 'roslib';

import type { RobotConnection } from '@/stores/connection/useConnectionStore.types';

export interface SystemStatusPanelProps {
  readonly connected: boolean;
  readonly onConnect?: () => void;
  readonly onDisconnect?: () => void;
  readonly robot: RobotConnection;
  readonly ros: Ros | undefined;
}

export interface StatusRowProps {
  readonly label: string;
  readonly value: string;
  readonly valueClass?: string;
}

export interface ExpandableRowProps {
  readonly count: number;
  readonly expanded: boolean;
  readonly label: string;
  readonly names: readonly string[];
  readonly onToggle: () => void;
}

export interface ExpandableRowListProps {
  readonly names: readonly string[];
}
