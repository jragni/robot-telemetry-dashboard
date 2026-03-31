import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';

export interface RobotCardActionsProps {
  readonly robotId: string;
  readonly robotName: string;
  readonly status: ConnectionStatus;
  readonly onRemove: () => void;
}
