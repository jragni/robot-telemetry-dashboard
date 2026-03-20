export const ROS_CONFIG = {
  reconnect: {
    maxAttempts: 3,
    baseIntervalMs: 3000,
    backoffMultiplier: 2, // 3s, 6s, 12s
  },
  throttle: {
    defaultMs: 100,
  },
  defaultPort: 9090,
} as const;
