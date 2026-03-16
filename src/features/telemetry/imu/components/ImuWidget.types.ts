import type { ImuViewMode } from '../imu.types';

export interface ImuPanelConfig {
  topicName?: string;
}

export interface ViewToggleProps {
  viewMode: ImuViewMode;
  onToggle: () => void;
}
