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
  selectedTopic: string; // ROS topic for cmd_vel
}

export interface ControlPanelProps {
  onTogglePilotMode?: () => void;
}

export interface TopicSelectorProps {
  selectedTopic: string;
  onTopicChange: (topic: string) => void;
}

export interface VelocitySlidersProps {
  linearVelocity: number;
  angularVelocity: number;
  onLinearChange: (value: number) => void;
  onAngularChange: (value: number) => void;
}
