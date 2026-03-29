export type ConnectionStatus = 'nominal' | 'caution' | 'critical' | 'offline';

export interface RobotConnection {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly status: ConnectionStatus;
  readonly latencyMs: number | null;
  readonly lastError: string | null;
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
