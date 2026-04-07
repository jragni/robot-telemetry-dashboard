import type { Direction } from '@/types/control.types';
import type { VideoStreamStatus } from '@/types/streaming.types';

import type { PilotTelemetry, ProxyStatus } from '../../types/PilotView.types';

export interface PilotHudProps {
  readonly angularVelocity: number;
  readonly connected: boolean;
  readonly isFullscreen: boolean;
  readonly linearVelocity: number;
  readonly onAngularVelocityChange: (value: number) => void;
  readonly onDirectionEnd: () => void;
  readonly onDirectionStart: (direction: Direction) => void;
  readonly onEmergencyStop: () => void;
  readonly onLinearVelocityChange: (value: number) => void;
  readonly onToggleFullscreen: () => void;
  readonly robotId?: string;
  readonly rosbridgeStatus: ProxyStatus;
  readonly telemetry: PilotTelemetry;
  readonly videoStatus: VideoStreamStatus;
}

export interface PilotHudMobileProps {
  readonly angularVelocity: number;
  readonly connected: boolean;
  readonly linearVelocity: number;
  readonly onAngularVelocityChange: (value: number) => void;
  readonly onDirectionEnd: () => void;
  readonly onDirectionStart: (direction: Direction) => void;
  readonly onEmergencyStop: () => void;
  readonly onLinearVelocityChange: (value: number) => void;
  readonly rosbridgeStatus: ProxyStatus;
  readonly telemetry: PilotTelemetry;
  readonly videoStatus: VideoStreamStatus;
}
