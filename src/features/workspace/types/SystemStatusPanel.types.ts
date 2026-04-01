export interface BatteryStatus {
  readonly percentage: number;
  readonly voltage: number;
  readonly charging: boolean;
}

export interface RosGraphCounts {
  readonly nodes: number;
  readonly nodeNames: readonly string[];
  readonly topics: number;
  readonly topicNames: readonly string[];
  readonly services: number;
  readonly serviceNames: readonly string[];
  readonly actions: number;
  readonly actionNames: readonly string[];
}

export interface StatusRowProps {
  readonly label: string;
  readonly value: string;
  readonly valueClass?: string;
}

export interface SystemStatusPanelProps {
  readonly name: string;
  readonly url: string;
  readonly connected: boolean;
  readonly status?: 'connected' | 'disconnected' | 'connecting' | 'error';
  readonly lastSeen: number | null;
  readonly uptimeSeconds: number | null;
  readonly battery: BatteryStatus | null;
  readonly rosGraph: RosGraphCounts | null;
  readonly onConnect?: () => void;
  readonly onDisconnect?: () => void;
}
