import type { Ros } from 'roslib';

export interface ControlsPanelProps {
  readonly connected: boolean;
  readonly robotId?: string;
  readonly ros: Ros | undefined;
  readonly topicName: string;
}
