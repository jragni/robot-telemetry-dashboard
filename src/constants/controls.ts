export const KEY_TO_DIRECTION: Record<string, 'forward' | 'backward' | 'left' | 'right'> = {
  ArrowUp: 'forward',
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

// Size is driven by the --dpad-size custom property so each consumer scales the
// cluster to its own container: the workspace ControlsPanel fluidly to its cell
// height (cqh), Pilot Mode to its HUD width (cqi). Falls back to 2.5rem (40px).
export const DPAD_BTN =
  'size-[var(--dpad-size,2.5rem)] bg-surface-tertiary border border-border rounded-sm font-mono text-xs text-text-muted hover:border-border-hover cursor-pointer transition-all duration-200 select-none';

export const DPAD_BTN_ACTIVE = 'bg-accent-subtle text-accent border-accent';

export const VELOCITY_LIMITS = {
  linear: { min: 0, max: 1.0, default: 0.15 },
  angular: { min: 0, max: 2.0, default: 0.39 },
} as const;
