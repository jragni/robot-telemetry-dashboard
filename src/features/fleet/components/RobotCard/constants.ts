import { AlertTriangle, CheckCircle, Loader2, MinusCircle } from 'lucide-react';

import type { ConnectionStatus, RobotColor } from '@/stores/connection/useConnectionStore.types';

import type { StatusConfig } from './types/RobotCard.types';

export const STATUS_CONFIG: Record<ConnectionStatus, StatusConfig> = {
  connected: {
    Icon: CheckCircle,
    bg: 'bg-status-nominal-bg',
    color: 'text-status-nominal',
    label: 'Nominal',
  },
  connecting: {
    Icon: Loader2,
    bg: 'bg-status-caution-bg',
    color: 'text-status-caution',
    label: 'Caution',
  },
  disconnected: {
    Icon: MinusCircle,
    bg: 'bg-status-offline-bg',
    color: 'text-status-offline',
    label: 'Offline',
  },
  error: {
    Icon: AlertTriangle,
    bg: 'bg-status-critical-bg',
    color: 'text-status-critical',
    label: 'Critical',
  },
};

export const ROBOT_COLOR_CLASSES: Record<RobotColor, { bg: string; border: string; text: string }> =
  {
    amber: { bg: 'bg-robot-amber', border: 'border-l-robot-amber', text: 'text-robot-amber' },
    blue: { bg: 'bg-robot-blue', border: 'border-l-robot-blue', text: 'text-robot-blue' },
    cyan: { bg: 'bg-robot-cyan', border: 'border-l-robot-cyan', text: 'text-robot-cyan' },
    green: { bg: 'bg-robot-green', border: 'border-l-robot-green', text: 'text-robot-green' },
    indigo: { bg: 'bg-robot-indigo', border: 'border-l-robot-indigo', text: 'text-robot-indigo' },
    lime: { bg: 'bg-robot-lime', border: 'border-l-robot-lime', text: 'text-robot-lime' },
    orange: { bg: 'bg-robot-orange', border: 'border-l-robot-orange', text: 'text-robot-orange' },
    pink: { bg: 'bg-robot-pink', border: 'border-l-robot-pink', text: 'text-robot-pink' },
    purple: { bg: 'bg-robot-purple', border: 'border-l-robot-purple', text: 'text-robot-purple' },
    red: { bg: 'bg-robot-red', border: 'border-l-robot-red', text: 'text-robot-red' },
    rose: { bg: 'bg-robot-rose', border: 'border-l-robot-rose', text: 'text-robot-rose' },
    teal: { bg: 'bg-robot-teal', border: 'border-l-robot-teal', text: 'text-robot-teal' },
  };
