export const ROSBRIDGE_PATH = '/rosbridge' as const;

export const CONNECTION_CONFIG = {
  /** Milliseconds to wait before attempting a reconnect. */
  reconnectInterval: 3000,
  /** Maximum number of reconnect attempts before giving up. */
  maxReconnectAttempts: 3,
  /** Milliseconds to wait for the initial connection to establish. */
  connectionTimeout: 10000,
} as const;
