export interface FleetGridProps {
  /** Currently selected robot id (highlighted with primary border). */
  selectedRobotId?: string | null;
  /** Called when the user selects a robot card. */
  onSelectRobot?: (robotId: string) => void;
}
