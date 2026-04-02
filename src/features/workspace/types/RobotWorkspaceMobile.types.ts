import type { RosTopic } from '@/hooks/useRosTopics';
import type { BatteryStatus } from '@/types/battery.types';
import type { RosGraph } from '@/types/ros-graph.types';
import type { LidarPoint } from '@/features/workspace/types/LidarPanel.types';
import type { TelemetrySeries } from '@/features/workspace/types/TelemetryPanel.types';

/** MobileDataPanelId
 * @description Panel IDs available as data tabs on mobile workspace.
 *  Controls is excluded — robot control happens in Pilot Mode.
 */
export type MobileDataPanelId = 'camera' | 'lidar' | 'status' | 'imu' | 'telemetry';

/** MobileTabId
 * @description All tab IDs in the mobile workspace bottom bar.
 *  Includes 5 data panels plus the Pilot nav action.
 */
export type MobileTabId = MobileDataPanelId | 'pilot';

/** RobotWorkspaceMobileProps
 * @description Props for the mobile workspace layout. Receives all
 *  subscription data from RobotWorkspace and renders one panel at a time
 *  with a bottom tab bar for switching.
 */
export interface RobotWorkspaceMobileProps {
  readonly robotId: string;
  readonly robotName: string;
  readonly robotUrl: string;
  readonly connected: boolean;
  readonly status: 'connected' | 'disconnected' | 'connecting' | 'error';
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
