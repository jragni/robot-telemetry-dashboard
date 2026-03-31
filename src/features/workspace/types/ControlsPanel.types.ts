import type { Direction, VelocityLimits } from '@/types/control.types';

export interface DpadButtonProps {
  readonly direction: Direction;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly label: string;
  readonly activeDirection: Direction | null;
  readonly disabled: boolean;
  readonly onStart: (direction: Direction) => void;
  readonly onEnd: () => void;
}

export interface VelocitySliderProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly unit: string;
  readonly disabled: boolean;
  readonly onChange: (value: number) => void;
}

export interface ControlsPanelProps {
  readonly linearVelocity: number;
  readonly angularVelocity: number;
  readonly linearLimits: VelocityLimits;
  readonly angularLimits: VelocityLimits;
  readonly isActive: boolean;
  readonly connected: boolean;
  readonly onDirectionStart: (direction: Direction) => void;
  readonly onDirectionEnd: () => void;
  readonly onLinearVelocityChange: (value: number) => void;
  readonly onAngularVelocityChange: (value: number) => void;
  readonly onEmergencyStop: () => void;
}
