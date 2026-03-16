import type { RobotStatus } from '../fleet.types';

export interface MiniPilotViewProps {
  status: RobotStatus;
  /** True when this cell is the currently selected robot for full control. */
  isSelected?: boolean;
  /** Called when the user clicks to select this robot. */
  onSelect?: (robotId: string) => void;
}
