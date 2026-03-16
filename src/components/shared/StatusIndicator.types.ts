import type { ConnectionState } from '@/types';

export interface StatusIndicatorProps {
  state: ConnectionState;
  label?: string;
  className?: string;
}
