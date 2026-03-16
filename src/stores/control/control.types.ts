// ---------------------------------------------------------------------------
// Per-robot control entry
// ---------------------------------------------------------------------------

export interface RobotControlEntry {
  linearVelocity: number;
  angularVelocity: number;
  selectedTopic: string;
  isEStopActive: boolean;
}

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface ControlState {
  robotControls: Record<string, RobotControlEntry>;
}

// ---------------------------------------------------------------------------
// Actions shape
// ---------------------------------------------------------------------------

export interface ControlActions {
  setLinearVelocity(robotId: string, velocity: number): void;
  setAngularVelocity(robotId: string, velocity: number): void;
  setSelectedTopic(robotId: string, topic: string): void;
  activateEStop(robotId: string): void;
  deactivateEStop(robotId: string): void;
  getControlState(robotId: string): RobotControlEntry;
}
