import type { BehaviorSubject } from 'rxjs';

import type { ConnectionState } from '@/shared/types/connection.types';

export interface RosTransportOptions {
  robotId: string;
  url: string;
  maxReconnectAttempts?: number;
  baseReconnectIntervalMs?: number;
  backoffMultiplier?: number;
}

export interface IRosTransport {
  readonly robotId: string;
  readonly connectionState$: BehaviorSubject<ConnectionState>;
  connect(): void;
  disconnect(): void;
  destroy(): void;
  getRos(): unknown;
}
