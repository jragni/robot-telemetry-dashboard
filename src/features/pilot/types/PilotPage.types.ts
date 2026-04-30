import type { Direction } from '@/types/control.types';
import type { VideoStreamStatus } from '@/types/streaming.types';

export interface LidarPoint {
  readonly x: number;
  readonly y: number;
  readonly distance: number;
}

export interface PilotTelemetry {
  readonly imu: { roll: number; pitch: number; yaw: number } | null;
  readonly lidarPoints: readonly LidarPoint[];
  readonly lidarRangeMax: number;
  readonly battery: { percentage: number; voltage: number } | null;
  readonly linearSpeed: number;
  readonly uptimeSeconds: number | null;
}

export type ProxyStatus = 'connected' | 'disconnected';

export interface PilotCameraProps {
  readonly videoStatus: VideoStreamStatus;
  readonly videoRef: React.RefObject<HTMLVideoElement | null>;
}

export interface PilotGyroReadoutProps {
  readonly pitch: number | null;
  readonly roll: number | null;
  readonly yaw: number | null;
}

export interface PilotStatusBarProps {
  readonly battery: { percentage: number; voltage: number } | null;
  readonly rosbridgeStatus: ProxyStatus;
  readonly videoStatus: VideoStreamStatus;
}

export interface StatusDotProps {
  readonly connected: boolean;
  readonly label: string;
}

export interface GyroInlineProps {
  readonly roll: number | null;
  readonly pitch: number | null;
  readonly yaw: number | null;
}

export interface PilotControlsProps {
  readonly angularVelocity: number;
  readonly connected: boolean;
  readonly isFullscreen: boolean;
  readonly linearVelocity: number;
  readonly onAngularVelocityChange: (value: number) => void;
  readonly onDirectionEnd: () => void;
  readonly onDirectionStart: (direction: Direction) => void;
  readonly onEmergencyStop: () => void;
  readonly onLinearVelocityChange: (value: number) => void;
  readonly onReconnect?: () => void;
}
