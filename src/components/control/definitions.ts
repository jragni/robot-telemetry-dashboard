// Control component prop types

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
