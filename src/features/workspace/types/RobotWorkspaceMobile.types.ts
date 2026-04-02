import type { BatteryStatus } from '@/types/battery.types';
import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';
import type { LidarPoint } from '@/features/workspace/types/LidarPanel.types';
import type { RosGraph } from '@/types/ros-graph.types';
import type { RosTopic } from '@/hooks/useRosTopics';
import type { TelemetrySeries } from '@/features/workspace/types/TelemetryPanel.types';

import type { PanelId } from './panel.types';

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
  readonly selectedTopics: Partial<Record<PanelId, string>>;
  readonly filteredTopics: Record<string, readonly RosTopic[]>;
  readonly onTopicChange: (panelId: PanelId, topicName: string) => void;
}

export type ActivePanelContentProps =
  Omit<RobotWorkspaceMobileProps, 'filteredTopics' | 'onTopicChange' | 'robotId' | 'selectedTopics'> & {
    readonly activePanel: MobileDataPanelId;
  };
