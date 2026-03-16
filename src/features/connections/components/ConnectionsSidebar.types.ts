import type { RobotConnection } from '@/types';

export interface DeleteConfirmDialogProps {
  robot: RobotConnection;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface RobotRowProps {
  robot: RobotConnection;
  isActive: boolean;
  onSelect: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onDeleteRequest: (robot: RobotConnection) => void;
}
