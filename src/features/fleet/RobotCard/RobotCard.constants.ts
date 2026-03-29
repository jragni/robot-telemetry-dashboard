import { CheckCircle, AlertTriangle, XCircle, MinusCircle } from 'lucide-react';
import type { ConnectionStatus } from '../../../shared/stores/connection/useConnectionStore.types';
import type { LucideIcon } from 'lucide-react';

export interface StatusConfig {
  readonly label: string;
  readonly color: string;
  readonly bg: string;
  readonly Icon: LucideIcon;
}

export const STATUS_CONFIG: Record<ConnectionStatus, StatusConfig> = {
  nominal: {
    label: 'Nominal',
    color: 'text-status-nominal',
    bg: 'bg-status-nominal-bg',
    Icon: CheckCircle,
  },
  caution: {
    label: 'Caution',
    color: 'text-status-caution',
    bg: 'bg-status-caution-bg',
    Icon: AlertTriangle,
  },
  critical: {
    label: 'Critical',
    color: 'text-status-critical',
    bg: 'bg-status-critical-bg',
    Icon: XCircle,
  },
  offline: {
    label: 'Offline',
    color: 'text-status-offline',
    bg: 'bg-status-offline-bg',
    Icon: MinusCircle,
  },
};
