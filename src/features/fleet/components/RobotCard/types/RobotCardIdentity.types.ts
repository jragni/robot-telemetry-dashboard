import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';

export interface RobotCardIdentityProps {
  readonly name: string;
  readonly status: ConnectionStatus;
  readonly iconColor: string;
}
