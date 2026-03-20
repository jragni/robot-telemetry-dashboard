import type { ConnectionState } from '@/shared/types/connection.types';

export interface NoConnectionOverlayProps {
  robotId: string;
  connectionState: ConnectionState;
  errorMessage?: string;
}
