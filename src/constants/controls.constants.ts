/** KEY_TO_DIRECTION
 * @description Maps keyboard keys to robot movement directions for D-pad
 *  keyboard control.
 */
export const KEY_TO_DIRECTION: Record<string, 'forward' | 'backward' | 'left' | 'right'> = {
  ArrowUp: 'forward',
  ArrowDown: 'backward',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

/** DPAD_BTN
 * @description Styling overrides for D-pad directional control buttons.
 */
export const DPAD_BTN =
  'w-8 h-8 @2xs:w-9 @2xs:h-9 @xs:w-10 @xs:h-10 bg-surface-tertiary border border-border rounded-sm font-mono text-xs text-text-muted hover:border-border-hover cursor-pointer transition-all duration-200 select-none';

/** DPAD_BTN_ACTIVE
 * @description Additional styling when a D-pad button is actively pressed.
 */
export const DPAD_BTN_ACTIVE = 'bg-accent-subtle text-accent border-accent';

/** VELOCITY_LIMITS
 * @description Default velocity ranges for robot control. Matches ROS2 cmd_vel
 *  conventions from EPIC/refactor-for-quality-of-life.
 */
export const VELOCITY_LIMITS = {
  linear: { min: 0, max: 1.0, default: 0.15 },
  angular: { min: 0, max: 2.0, default: 0.39 },
} as const;
