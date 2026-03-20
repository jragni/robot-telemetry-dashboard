import type { RobotConnection } from '@/shared/types/connection.types';

export interface ConnectionsState {
  robots: RobotConnection[];
  activeRobotId: string | null;
}

export interface ConnectionsActions {
  addRobot: (robot: RobotConnection) => void;
  removeRobot: (robotId: string) => void;
  setActiveRobot: (robotId: string | null) => void;
}

export type ConnectionsStore = ConnectionsState & ConnectionsActions;
