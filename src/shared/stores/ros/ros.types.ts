import type { ConnectionState } from '@/shared/types/connection.types';

export interface RobotConnectionState {
  state: ConnectionState;
  error: string | null;
}

export interface RosState {
  connectionStates: Record<string, RobotConnectionState>;
}

export interface RosActions {
  setConnectionState: (robotId: string, state: ConnectionState) => void;
  setConnectionError: (robotId: string, error: string | null) => void;
  getConnectionState: (robotId: string) => RobotConnectionState;
  removeRobot: (robotId: string) => void;
}

export type RosStore = RosState & RosActions;
