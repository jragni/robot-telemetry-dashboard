// Control types, interfaces, and enums

export type Direction = 'forward' | 'backward' | 'left' | 'right' | 'stop';

export interface VelocityLimits {
  linear: {
    min: number;
    max: number;
    default: number;
  };
  angular: {
    min: number;
    max: number;
    default: number;
  };
}

export interface ControlState {
  linearVelocity: number; // m/s
  angularVelocity: number; // rad/s
  isActive: boolean;
}

export interface ControlPanelProps {
  onTogglePilotMode?: () => void;
}
