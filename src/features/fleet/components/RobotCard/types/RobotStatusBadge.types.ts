import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';

export interface RobotStatusBadgeProps {
  readonly status: ConnectionStatus;
}
