/**
 * ROS2 Configuration
 *
 * Minimal configuration for ROS2 communication via rosbridge_suite.
 * Topics, message types, and throttle rates are managed dynamically.
 */

// Connection settings
export const CONNECTION_CONFIG = {
  // Auto-reconnect on connection loss
  autoReconnect: true,
  // Reconnect interval in milliseconds
  reconnectInterval: 3000,
  // Connection timeout in milliseconds
  connectionTimeout: 10000,
} as const;
