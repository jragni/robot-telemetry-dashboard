export const VIDEO_STATUS_LABELS: Record<
  'connecting' | 'failed' | 'idle' | 'reconnecting',
  string
> = {
  connecting: 'Connecting...',
  failed: 'Stream failed',
  idle: 'No video stream',
  reconnecting: 'Reconnecting...',
};

export const HUD_PANEL_BASE =
  'bg-surface-base/60 backdrop-blur-sm border border-accent/20 border-t-accent/10 rounded-sm pointer-events-auto';

export const PILOT_FULLSCREEN_Z = 'z-50';
