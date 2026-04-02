import type { BatteryStatus } from '@/types/battery.types';
import type { RosGraph } from '@/types/ros-graph.types';

export interface SystemStatusPanelProps {
  readonly battery: BatteryStatus | null;
  readonly connected: boolean;
  readonly lastSeen: number | null;
  readonly name: string;
  readonly onConnect?: () => void;
  readonly onDisconnect?: () => void;
  readonly rosGraph: RosGraph | null;
  readonly status?: 'connected' | 'disconnected' | 'connecting' | 'error';
  readonly uptimeSeconds: number | null;
  readonly url: string;
}
