import type { RobotStatus } from '../fleet.types';

export interface SplitPilotGridProps {
  robots: RobotStatus[];
  /** Currently selected robot id. */
  selectedRobotId?: string | null;
  /** Called when a cell is clicked to select a robot for full control. */
  onSelectRobot?: (robotId: string) => void;
}
