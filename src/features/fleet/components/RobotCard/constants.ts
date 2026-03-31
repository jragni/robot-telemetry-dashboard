import { CheckCircle, MinusCircle } from 'lucide-react';
import type {
  ConnectionStatus,
  RobotColor,
} from '@/stores/connection/useConnectionStore.types';
import type { StatusConfig } from './types/RobotCard.types';

export const STATUS_CONFIG: Record<ConnectionStatus, StatusConfig> = {
  connected: {
    label: 'Connected',
    color: 'text-status-nominal',
    bg: 'bg-status-nominal-bg',
    Icon: CheckCircle,
  },
  disconnected: {
    label: 'Disconnected',
    color: 'text-status-offline',
    bg: 'bg-status-offline-bg',
    Icon: MinusCircle,
  },
};

export const ROBOT_COLOR_BORDER: Record<RobotColor, string> = {
  blue: 'border-l-robot-blue',
  cyan: 'border-l-robot-cyan',
  green: 'border-l-robot-green',
  amber: 'border-l-robot-amber',
  red: 'border-l-robot-red',
  purple: 'border-l-robot-purple',
};

export const ROBOT_COLOR_BG: Record<RobotColor, string> = {
  blue: 'bg-robot-blue',
  cyan: 'bg-robot-cyan',
  green: 'bg-robot-green',
  amber: 'bg-robot-amber',
  red: 'bg-robot-red',
  purple: 'bg-robot-purple',
};

export const ROBOT_COLOR_TEXT: Record<RobotColor, string> = {
  blue: 'text-robot-blue',
  cyan: 'text-robot-cyan',
  green: 'text-robot-green',
  amber: 'text-robot-amber',
  red: 'text-robot-red',
  purple: 'text-robot-purple',
};
