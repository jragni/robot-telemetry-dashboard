import type { LucideIcon } from 'lucide-react';
import type {
  ConnectionStatus,
  RobotColor,
} from '@/stores/connection/useConnectionStore.types';

export interface SidebarProps {
  readonly collapsed: boolean;
  readonly onToggleCollapse: () => void;
}

export interface NavItemData {
  readonly Icon: LucideIcon;
  readonly label: string;
  readonly path: string;
  readonly status?: ConnectionStatus;
  readonly robotColor?: RobotColor;
}
