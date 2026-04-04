import type { RosTopic } from '@/hooks/useRosTopics';
import type { PanelId } from '@/types/panel.types';
import type { BatteryStatus } from '@/types/battery.types';
import type { RosGraph } from '@/types/ros-graph.types';
import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';
import type { LidarPoint } from '@/features/workspace/types/LidarPanel.types';
import type { TelemetrySeries } from '@/features/workspace/types/TelemetryPanel.types';

export type MobileDataPanelId = 'camera' | 'imu' | 'lidar' | 'status' | 'telemetry';

export type MobileTabId = MobileDataPanelId | 'pilot';

export interface RobotWorkspaceMobileProps {
  readonly battery: BatteryStatus | null;
  readonly connected: boolean;
  readonly filteredTopics: Record<string, readonly RosTopic[]>;
  readonly imuPitch: number;
  readonly imuRoll: number;
  readonly imuYaw: number;
  readonly lastSeen: number | null;
  readonly lidarPoints: readonly LidarPoint[];
  readonly lidarRangeMax: number;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;
  readonly onTopicChange: (panelId: PanelId, topicName: string) => void;
  readonly robotId: string;
  readonly robotName: string;
  readonly robotUrl: string;
  readonly rosGraph: RosGraph | null;
  readonly selectedCameraTopic: string;
  readonly selectedTopics: Partial<Record<string, string>>;
  readonly status: ConnectionStatus;
  readonly telemetrySeries: readonly TelemetrySeries[];
  readonly telemetryTimeWindowMs: number;
  readonly uptimeSeconds: number | null;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
}
