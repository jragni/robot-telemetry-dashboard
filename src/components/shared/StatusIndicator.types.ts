import type { ConnectionState } from '@/types/connection.types';

export interface StatusIndicatorProps {
  state: ConnectionState;
  label?: string;
  className?: string;
}
