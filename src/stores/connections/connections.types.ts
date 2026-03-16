import type { RobotConnection } from '@/types/connection.types';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface ConnectionsState {
  robots: RobotConnection[];
  activeRobotId: string | null;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

export interface ConnectionsActions {
  addRobot(robot: Omit<RobotConnection, 'id' | 'createdAt'>): string;
  removeRobot(id: string): void;
  setActiveRobot(id: string | null): void;
  getActiveRobot(): RobotConnection | undefined;
}
