import { AlertTriangle, CheckCircle, Loader2, MinusCircle } from 'lucide-react';
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
  connecting: {
    label: 'Connecting',
    color: 'text-status-caution',
    bg: 'bg-status-caution-bg',
    Icon: Loader2,
  },
  error: {
    label: 'Error',
    color: 'text-status-critical',
    bg: 'bg-status-critical-bg',
    Icon: AlertTriangle,
  },
};

/** ROBOT_COLOR_CLASSES
 * @description Maps each robot color to its Tailwind utility classes for
 *  border, background, and text. Single source of truth — eliminates
 *  duplicated color maps.
 */
export const ROBOT_COLOR_CLASSES: Record<RobotColor, { border: string; bg: string; text: string }> = {
  blue: { border: 'border-l-robot-blue', bg: 'bg-robot-blue', text: 'text-robot-blue' },
  cyan: { border: 'border-l-robot-cyan', bg: 'bg-robot-cyan', text: 'text-robot-cyan' },
  green: { border: 'border-l-robot-green', bg: 'bg-robot-green', text: 'text-robot-green' },
  amber: { border: 'border-l-robot-amber', bg: 'bg-robot-amber', text: 'text-robot-amber' },
  red: { border: 'border-l-robot-red', bg: 'bg-robot-red', text: 'text-robot-red' },
  purple: { border: 'border-l-robot-purple', bg: 'bg-robot-purple', text: 'text-robot-purple' },
  teal: { border: 'border-l-robot-teal', bg: 'bg-robot-teal', text: 'text-robot-teal' },
  orange: { border: 'border-l-robot-orange', bg: 'bg-robot-orange', text: 'text-robot-orange' },
  pink: { border: 'border-l-robot-pink', bg: 'bg-robot-pink', text: 'text-robot-pink' },
  lime: { border: 'border-l-robot-lime', bg: 'bg-robot-lime', text: 'text-robot-lime' },
  indigo: { border: 'border-l-robot-indigo', bg: 'bg-robot-indigo', text: 'text-robot-indigo' },
  rose: { border: 'border-l-robot-rose', bg: 'bg-robot-rose', text: 'text-robot-rose' },
};
