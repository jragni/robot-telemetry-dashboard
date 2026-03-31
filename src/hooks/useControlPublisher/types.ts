import type { TwistMessage } from '@/types/ros2-messages.types';
import type { Direction } from '@/types/control.types';

export interface UseControlPublisherOptions {
  readonly publishRate?: number;
  readonly onPublish?: (twist: TwistMessage) => void;
}

export interface UseControlPublisherReturn {
  readonly linearVelocity: number;
  readonly angularVelocity: number;
  readonly isActive: boolean;
  readonly handleDirectionStart: (direction: Direction) => void;
  readonly handleDirectionEnd: () => void;
  readonly handleLinearChange: (value: number) => void;
  readonly handleAngularChange: (value: number) => void;
  readonly handleEmergencyStop: () => void;
}
