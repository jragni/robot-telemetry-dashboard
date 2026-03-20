import type { ConnectionState } from '@/shared/types/connection.types';

export interface UseRosConnectionResult {
  isConnected: boolean;
  connectionState: ConnectionState;
  transport: unknown;
}
