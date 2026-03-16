export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface RobotConnection {
  id: string;
  name: string;
  baseUrl: string;
  createdAt: number;
}

export interface ConnectionError {
  message: string;
  code?: string;
  timestamp: number;
}
