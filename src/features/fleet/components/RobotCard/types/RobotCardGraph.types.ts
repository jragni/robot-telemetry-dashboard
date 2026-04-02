import type { RosGraph } from '@/types/ros-graph.types';

export interface RobotCardGraphProps {
  readonly graph: RosGraph | null;
  readonly isConnected: boolean;
}
