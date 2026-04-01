import type { Direction } from '@/types/control.types';
import type { VideoStreamStatus } from '@/types/streaming.types';

export type { VideoStreamStatus };

/** LidarPoint
 * @description A single LiDAR scan point in Cartesian coordinates with distance metadata.
 */
export interface LidarPoint {
  readonly x: number;
  readonly y: number;
  readonly distance: number;
}

/** PilotTelemetry
 * @description Aggregated telemetry state for the Pilot HUD. All fields are
 *  nullable — null indicates no data received yet.
 */
export interface PilotTelemetry {
  readonly imu: { roll: number; pitch: number; yaw: number } | null;
  readonly lidarPoints: readonly LidarPoint[];
  readonly lidarRangeMax: number;
  readonly battery: { percentage: number; voltage: number } | null;
  readonly linearSpeed: number;
  readonly uptimeSeconds: number | null;
}

/** ProxyStatus
 * @description Connection state for each independent proxy (rosbridge or video).
 */
export type ProxyStatus = 'connected' | 'disconnected';

/** PilotHudProps
 * @description Props for the PilotHud overlay container.
 */
export interface PilotHudProps {
  readonly telemetry: PilotTelemetry;
  readonly videoStatus: VideoStreamStatus;
  readonly rosbridgeStatus: ProxyStatus;
  readonly isFullscreen: boolean;
  readonly connected: boolean;
  readonly onToggleFullscreen: () => void;
  readonly onDirectionStart: (direction: Direction) => void;
  readonly onDirectionEnd: () => void;
  readonly onLinearVelocityChange: (value: number) => void;
  readonly onAngularVelocityChange: (value: number) => void;
  readonly onEmergencyStop: () => void;
  readonly linearVelocity: number;
  readonly angularVelocity: number;
}

/** PilotCameraProps
 * @description Props for the full-bleed camera background component.
 */
export interface PilotCameraProps {
  readonly videoStatus: VideoStreamStatus;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
}

/** PilotCompassProps
 * @description Props for the horizontal heading strip.
 */
export interface PilotCompassProps {
  readonly heading: number;
}

/** PilotLidarMinimapProps
 * @description Props for the fixed-size LiDAR minimap overlay.
 */
export interface PilotLidarMinimapProps {
  readonly points: readonly LidarPoint[];
  readonly rangeMax: number;
  readonly heading: number;
}

/** PilotGyroReadoutProps
 * @description Props for the gyro + speed readout panel.
 */
export interface PilotGyroReadoutProps {
  readonly pitch: number | null;
  readonly roll: number | null;
  readonly yaw: number | null;
}

/** PilotStatusBarProps
 * @description Props for the battery + dual connection status panel.
 */
export interface PilotStatusBarProps {
  readonly battery: { percentage: number; voltage: number } | null;
  readonly rosbridgeStatus: ProxyStatus;
  readonly videoStatus: VideoStreamStatus;
}

/** PilotControlsProps
 * @description Props for the compact HUD controls overlay.
 */
export interface PilotControlsProps {
  readonly connected: boolean;
  readonly linearVelocity: number;
  readonly angularVelocity: number;
  readonly isFullscreen: boolean;
  readonly onDirectionStart: (direction: Direction) => void;
  readonly onDirectionEnd: () => void;
  readonly onLinearVelocityChange: (value: number) => void;
  readonly onAngularVelocityChange: (value: number) => void;
  readonly onEmergencyStop: () => void;
}
