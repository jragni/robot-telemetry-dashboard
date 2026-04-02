import type { BatteryStatus } from '@/types/battery.types';
import type { RosGraph } from '@/types/ros-graph.types';

export interface StatusRowProps {
  readonly label: string;
  readonly value: string;
  readonly valueClass?: string;
}

export interface ExpandableRowProps {
  readonly label: string;
  readonly count: number;
  readonly names: readonly string[];
  readonly expanded: boolean;
  readonly onToggle: () => void;
}

export interface SystemStatusPanelProps {
  readonly name: string;
  readonly url: string;
  readonly connected: boolean;
  readonly status?: 'connected' | 'disconnected' | 'connecting' | 'error';
  readonly lastSeen: number | null;
  readonly uptimeSeconds: number | null;
  readonly battery: BatteryStatus | null;
  readonly rosGraph: RosGraph | null;
  readonly onConnect?: () => void;
  readonly onDisconnect?: () => void;
}
