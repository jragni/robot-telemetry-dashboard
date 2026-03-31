import type { RobotConnection } from '@/stores/connection/useConnectionStore.types';

export interface FleetRobotGridProps {
  readonly robots: RobotConnection[];
  readonly onRemove: (id: string) => void;
}
