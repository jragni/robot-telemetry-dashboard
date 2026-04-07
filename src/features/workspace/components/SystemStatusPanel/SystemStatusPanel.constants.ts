import type { ComponentType } from 'react';
import { Loader2, PlugZap, Unplug } from 'lucide-react';

import type { ConnectionStatus } from '@/stores/connection/useConnectionStore.types';

export const STATUS_DISPLAY: Record<
  ConnectionStatus,
  { dotClass: string; label: string; textClass: string }
> = {
  connected: {
    dotClass: 'bg-status-nominal motion-safe:animate-pulse',
    label: 'NOMINAL',
    textClass: 'text-status-nominal',
  },
  connecting: {
    dotClass: 'bg-status-caution motion-safe:animate-pulse',
    label: 'CAUTION',
    textClass: 'text-status-offline',
  },
  disconnected: {
    dotClass: 'bg-status-critical',
    label: 'OFFLINE',
    textClass: 'text-status-offline',
  },
  error: {
    dotClass: 'bg-status-critical',
    label: 'OFFLINE',
    textClass: 'text-status-offline',
  },
};

export const CONNECTION_BUTTON: Record<
  ConnectionStatus,
  { icon: ComponentType<{ size: number; className?: string }>; label: string }
> = {
  connected: { icon: Unplug, label: 'Disconnect' },
  connecting: { icon: Loader2, label: 'Connecting' },
  disconnected: { icon: PlugZap, label: 'Connect' },
  error: { icon: PlugZap, label: 'Connect' },
};
