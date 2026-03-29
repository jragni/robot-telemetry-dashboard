export type ConnectionStatus = 'connected' | 'disconnected';

export type RobotColor = 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'purple';

export interface RobotConnection {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly status: ConnectionStatus;
  readonly lastSeen: number | null;
  readonly lastError: string | null;
  readonly color: RobotColor;
}

export interface ConnectionState {
  readonly robots: Record<string, RobotConnection>;
}

export interface ConnectionActions {
  readonly addRobot: (name: string, url: string) => void;
  readonly removeRobot: (id: string) => void;
  readonly updateRobot: (id: string, patch: Partial<RobotConnection>) => void;
}

export type ConnectionStore = ConnectionState & ConnectionActions;
