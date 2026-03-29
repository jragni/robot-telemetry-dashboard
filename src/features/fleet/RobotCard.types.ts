import type { RobotConnection } from '../../shared/stores/connection/useConnectionStore.types';

export interface RobotCardProps {
  readonly robot: RobotConnection;
  readonly onRemove: (id: string) => void;
}
