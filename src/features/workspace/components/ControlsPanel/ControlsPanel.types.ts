import type { Ros } from 'roslib';

export interface ControlsPanelProps {
  readonly connected: boolean;
  readonly ros: Ros | undefined;
  readonly topicName: string;
}
