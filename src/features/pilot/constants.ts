export const VIDEO_STATUS_LABELS: Record<'connecting' | 'failed' | 'idle' | 'reconnecting', string> = {
  connecting: 'Connecting...',
  failed: 'Stream failed',
  idle: 'No video stream',
  reconnecting: 'Reconnecting...',
};

export const HUD_PANEL_BASE =
  'bg-surface-base/60 backdrop-blur-sm border border-accent/20 border-t-accent/10 rounded-sm pointer-events-auto';

export const PILOT_FULLSCREEN_Z = 'z-50';

export const PLACEHOLDER_TELEMETRY = {
  battery: null,
  imu: { pitch: 0, roll: 0, yaw: 0 },
  lidarPoints: [],
  lidarRangeMax: 20,
  linearSpeed: 0,
  uptimeSeconds: null,
} as const;
