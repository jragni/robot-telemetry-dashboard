import type { RobotStatus } from '../fleet.types';

export interface RobotCardProps {
  status: RobotStatus;
  /** If true the card border highlights as the selected robot. */
  isSelected?: boolean;
  /** Called when the user clicks the card body to select this robot. */
  onSelect?: (robotId: string) => void;
}
