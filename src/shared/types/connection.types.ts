export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

export interface RobotConnection {
  id: string;
  name: string;
  url: string;
}
