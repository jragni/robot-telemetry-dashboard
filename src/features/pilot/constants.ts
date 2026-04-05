import { CANVAS_FALLBACKS } from '@/utils/canvasColors';

export const MINIMAP_SIZE_MIN = 120;

export const MINIMAP_SIZE_MAX = 220;

export const MINIMAP_VIEWPORT_RATIO = 0.2;

export const MINIMAP_RANGE_DEFAULT = 20;

export const PILOT_ZOOM_MIN = 0.5;

export const PILOT_ZOOM_MAX = 4;

export const PILOT_ZOOM_STEP = 0.2;

// Maps local color keys to CSS custom property names for canvas resolution
export const LIDAR_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  caution: '--color-status-caution',
  critical: '--color-status-critical',
  gridLine: '--color-border',
  nominal: '--color-status-nominal',
  textMuted: '--color-text-muted',
};

export const LIDAR_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  caution: CANVAS_FALLBACKS.statusCaution,
  critical: CANVAS_FALLBACKS.statusCritical,
  gridLine: CANVAS_FALLBACKS.border,
  nominal: CANVAS_FALLBACKS.statusNominal,
  textMuted: CANVAS_FALLBACKS.textMuted,
};

export const LIDAR_TICK_LENGTH = 4;

export const LIDAR_DETAIL_THRESHOLD = 160;

export const LIDAR_DISTANCE_RATIO_CAUTION = 0.4;

export const LIDAR_DISTANCE_RATIO_CRITICAL = 0.7;

export const LIDAR_ROBOT_TRIANGLE_RATIO = 0.035;

export const LIDAR_ROBOT_TRIANGLE_MIN = 5;

export const VIDEO_STATUS_LABELS: Record<'connecting' | 'failed' | 'idle' | 'reconnecting', string> = {
  connecting: 'Connecting...',
  failed: 'Stream failed',
  idle: 'No video stream',
  reconnecting: 'Reconnecting...',
};

export const HUD_PANEL_BASE =
  'bg-surface-base/60 backdrop-blur-sm border border-accent/20 border-t-accent/10 rounded-sm pointer-events-auto';

export const LIDAR_POINT_GLOW = 2;

export const PILOT_FULLSCREEN_Z = 'z-50';

export const MINIMAP_SIZE_MOBILE_MAX = 100;

export const PLACEHOLDER_TELEMETRY = {
  battery: null,
  imu: { pitch: 0, roll: 0, yaw: 0 },
  lidarPoints: [],
  lidarRangeMax: 20,
  linearSpeed: 0,
  uptimeSeconds: null,
} as const;
