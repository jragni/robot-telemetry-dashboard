import { CANVAS_FALLBACKS } from '@/utils';

// Desktop dimensions
export const COMPASS_STRIP_WIDTH_MIN = 200;
export const COMPASS_STRIP_WIDTH_MAX = 320;
export const COMPASS_STRIP_VIEWPORT_RATIO = 0.25;
export const COMPASS_STRIP_HEIGHT = 40;
export const COMPASS_TICK_HEIGHT_MAJOR = 12;
export const COMPASS_TICK_HEIGHT_MINOR = 6;
export const COMPASS_POINTER_HALF_WIDTH = 5;
export const COMPASS_POINTER_HEIGHT = 6;

// Mobile dimensions
export const COMPASS_STRIP_HEIGHT_MOBILE = 24;
export const COMPASS_TICK_HEIGHT_MAJOR_MOBILE = 8;
export const COMPASS_TICK_HEIGHT_MINOR_MOBILE = 4;
export const COMPASS_POINTER_HALF_WIDTH_MOBILE = 4;
export const COMPASS_POINTER_HEIGHT_MOBILE = 5;

// Shared
export const COMPASS_DEGREES_VISIBLE = 120;
export const COMPASS_FADE_WIDTH = 30;
export const COMPASS_TICK_MAJOR_INTERVAL = 30;
export const COMPASS_TICK_MINOR_INTERVAL = 10;

export const COMPASS_TOKEN_MAP: Record<string, string> = {
  accent: '--color-accent',
  textMuted: '--color-text-muted',
  tickMajor: '--color-text-secondary',
  tickMinor: '--color-border',
};

export const COMPASS_COLOR_FALLBACKS = {
  accent: CANVAS_FALLBACKS.accent,
  textMuted: CANVAS_FALLBACKS.textMuted,
  tickMajor: CANVAS_FALLBACKS.textSecondary,
  tickMinor: CANVAS_FALLBACKS.border,
};
