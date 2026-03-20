export type ConnectionState =
  | 'connected'
  | 'connecting'
  | 'disconnected'
  | 'error';

export interface StatusIndicatorProps {
  state: ConnectionState;
  label?: string;
  className?: string;
}
