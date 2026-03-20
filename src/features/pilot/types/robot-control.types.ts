export type Direction = 'forward' | 'backward' | 'left' | 'right' | 'stop';

export interface ControlState {
  selectedTopic: string;
  linearVelocity: number;
  angularVelocity: number;
  eStopActive: boolean;
  activeDirection: Direction | null;
  activateEStop(): void;
  releaseEStop(): void;
  setTopic(topic: string): void;
  setLinearVelocity(v: number): void;
  setAngularVelocity(v: number): void;
  setDirection(d: Direction | null): void;
}
