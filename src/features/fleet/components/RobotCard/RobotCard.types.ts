import type { RobotConnection } from '@/stores/connection/useConnectionStore.types';
import type { LucideIcon } from 'lucide-react';

export interface RobotCardProps {
  readonly robot: RobotConnection;
  readonly onRemove: (id: string) => void;
}

export interface StatusConfig {
  readonly label: string;
  readonly color: string;
  readonly bg: string;
  readonly Icon: LucideIcon;
}
