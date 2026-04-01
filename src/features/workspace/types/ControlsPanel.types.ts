import type { Direction, VelocityLimits } from '@/types/control.types';

export interface ControlsPanelProps {
  readonly linearVelocity: number;
  readonly angularVelocity: number;
  readonly linearLimits: VelocityLimits;
  readonly angularLimits: VelocityLimits;
  readonly isActive: boolean;
  readonly connected: boolean;
  readonly robotId?: string;
  readonly onDirectionStart: (direction: Direction) => void;
  readonly onDirectionEnd: () => void;
  readonly onLinearVelocityChange: (value: number) => void;
  readonly onAngularVelocityChange: (value: number) => void;
  readonly onEmergencyStop: () => void;
}
