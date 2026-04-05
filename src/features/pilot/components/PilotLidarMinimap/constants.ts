import { CANVAS_FALLBACKS } from '@/utils/canvasColors';

export const MINIMAP_SIZE_MIN = 120;
export const MINIMAP_SIZE_MAX = 220;
export const MINIMAP_VIEWPORT_RATIO = 0.2;
export const MINIMAP_RANGE_DEFAULT = 20;
export const MINIMAP_SIZE_MOBILE_MAX = 100;

export const PILOT_ZOOM_MIN = 0.5;
export const PILOT_ZOOM_MAX = 4;
export const PILOT_ZOOM_STEP = 0.2;

export const LIDAR_TICK_LENGTH = 4;
export const LIDAR_DETAIL_THRESHOLD = 160;
export const LIDAR_DISTANCE_RATIO_CAUTION = 0.4;
export const LIDAR_DISTANCE_RATIO_CRITICAL = 0.7;
export const LIDAR_POINT_GLOW = 2;
export const LIDAR_ROBOT_TRIANGLE_MIN = 5;
export const LIDAR_ROBOT_TRIANGLE_RATIO = 0.035;

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
