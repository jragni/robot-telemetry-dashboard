import type { Ros } from 'roslib';

import type { LidarPoint } from '@/types/lidar.types';

export type { LidarPoint };

export interface LidarPanelProps {
  readonly connected: boolean;
  readonly ros: Ros | undefined;
  readonly topicName: string;
}
