export interface BatteryStatus {
  readonly percentage: number;
  readonly voltage: number;
  readonly charging: boolean;
}

export interface RosGraphCounts {
  readonly nodes: number;
  readonly topics: number;
  readonly services: number;
  readonly actions: number;
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
  readonly lastSeen: number | null;
  readonly uptimeSeconds: number | null;
  readonly battery: BatteryStatus | null;
  readonly rosGraph: RosGraphCounts | null;
}
