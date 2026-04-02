import type { RosTopic } from '@/hooks/useRosTopics';
import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';
import type { BatteryStatus } from '@/types/battery.types';
import type { RosGraph } from '@/types/ros-graph.types';
import type { LidarPoint } from '@/features/workspace/types/LidarPanel.types';
import type { TelemetrySeries } from '@/features/workspace/types/TelemetryPanel.types';

export type MobileDataPanelId = 'camera' | 'lidar' | 'status' | 'imu' | 'telemetry';

export type MobileTabId = MobileDataPanelId | 'pilot';

export interface RobotWorkspaceMobileProps {
  readonly robotId: string;
  readonly robotName: string;
  readonly robotUrl: string;
  readonly connected: boolean;
  readonly status: ConnectionStatus;
  readonly lastSeen: number | null;
  readonly onConnect: () => void;
  readonly onDisconnect: () => void;

  // ── Camera ──
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
  readonly selectedCameraTopic: string;

  // ── LiDAR ──
  readonly lidarPoints: readonly LidarPoint[];
  readonly lidarRangeMax: number;

  // ── System Status ──
  readonly uptimeSeconds: number | null;
  readonly battery: BatteryStatus | null;
  readonly rosGraph: RosGraph | null;

  // ── IMU ──
  readonly imuRoll: number;
  readonly imuPitch: number;
  readonly imuYaw: number;

  // ── Telemetry ──
  readonly telemetrySeries: readonly TelemetrySeries[];
  readonly telemetryTimeWindowMs: number;

  // ── Topic selection ──
  readonly selectedTopics: Record<string, string>;
  readonly filteredTopics: Record<string, readonly RosTopic[]>;
  readonly onTopicChange: (panelId: string, topicName: string) => void;
}
