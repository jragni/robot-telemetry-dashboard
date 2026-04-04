import { CANVAS_FALLBACKS } from '@/utils/canvasColors';

export const MINIMAP_SIZE_MIN = 120;

export const MINIMAP_SIZE_MAX = 220;

export const MINIMAP_VIEWPORT_RATIO = 0.2;

export const MINIMAP_RANGE_DEFAULT = 20;

export const PILOT_ZOOM_MIN = 0.5;

export const PILOT_ZOOM_MAX = 4;

export const PILOT_ZOOM_STEP = 0.2;

export const COMPASS_STRIP_WIDTH_MIN = 200;

export const COMPASS_STRIP_WIDTH_MAX = 320;

export const COMPASS_STRIP_VIEWPORT_RATIO = 0.25;

export const COMPASS_STRIP_HEIGHT = 40;

export const COMPASS_TICK_MAJOR_INTERVAL = 30;

export const COMPASS_TICK_MINOR_INTERVAL = 10;

export const COMPASS_DEGREES_VISIBLE = 120;

export const COMPASS_TICK_HEIGHT_MAJOR = 12;

export const COMPASS_TICK_HEIGHT_MINOR = 6;

export const COMPASS_FADE_WIDTH = 30;

export const COMPASS_POINTER_HALF_WIDTH = 5;

export const COMPASS_POINTER_HEIGHT = 6;

// Maps local color keys to CSS custom property names for canvas resolution
export const COMPASS_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  textMuted: '--color-text-muted',
  tickMinor: '--color-border',
  tickMajor: '--color-text-secondary',
};

export const COMPASS_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  textMuted: CANVAS_FALLBACKS.textMuted,
  tickMinor: CANVAS_FALLBACKS.border,
  tickMajor: CANVAS_FALLBACKS.textSecondary,
};

// Maps local color keys to CSS custom property names for canvas resolution
export const LIDAR_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  textMuted: '--color-text-muted',
  gridLine: '--color-border',
  nominal: '--color-status-nominal',
  caution: '--color-status-caution',
  critical: '--color-status-critical',
};

export const LIDAR_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  textMuted: CANVAS_FALLBACKS.textMuted,
  gridLine: CANVAS_FALLBACKS.border,
  nominal: CANVAS_FALLBACKS.statusNominal,
  caution: CANVAS_FALLBACKS.statusCaution,
  critical: CANVAS_FALLBACKS.statusCritical,
};

export const LIDAR_TICK_LENGTH = 4;

export const LIDAR_DETAIL_THRESHOLD = 160;

export const LIDAR_DISTANCE_RATIO_CAUTION = 0.4;

export const LIDAR_DISTANCE_RATIO_CRITICAL = 0.7;

export const LIDAR_ROBOT_TRIANGLE_RATIO = 0.035;

export const LIDAR_ROBOT_TRIANGLE_MIN = 5;

export const VIDEO_STATUS_LABELS: Record<'idle' | 'connecting' | 'reconnecting' | 'failed', string> = {
  idle: 'No video stream',
  connecting: 'Connecting...',
  reconnecting: 'Reconnecting...',
  failed: 'Stream failed',
};

export const HUD_PANEL_BASE =
  'bg-surface-base/60 backdrop-blur-sm border border-accent/20 border-t-accent/10 rounded-sm pointer-events-auto';

export const LIDAR_POINT_GLOW = 2;

export const PILOT_FULLSCREEN_Z = 'z-50';

export const MINIMAP_SIZE_MOBILE_MAX = 100;

export const COMPASS_STRIP_HEIGHT_MOBILE = 24;

export const COMPASS_TICK_HEIGHT_MAJOR_MOBILE = 8;

export const COMPASS_TICK_HEIGHT_MINOR_MOBILE = 4;

export const COMPASS_POINTER_HALF_WIDTH_MOBILE = 4;

export const COMPASS_POINTER_HEIGHT_MOBILE = 5;

export const PLACEHOLDER_TELEMETRY = {
  imu: { roll: 0, pitch: 0, yaw: 0 },
  lidarPoints: [],
  lidarRangeMax: 20,
  battery: null,
  linearSpeed: 0,
  uptimeSeconds: null,
} as const;
