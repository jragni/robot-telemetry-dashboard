import type { StatusDotProps } from '../types/PilotView.types';

/** StatusDot
 * @description Renders a colored dot + label for connection status.
 *  Used in mobile HUD overlay to indicate ROS and video link state.
 */
export function StatusDot({ connected, label }: StatusDotProps) {
  return (
    <div className="flex items-center gap-1">
      <span
        className={`size-1.5 rounded-full ${
          connected
            ? 'bg-status-nominal motion-safe:animate-pulse'
            : 'bg-status-critical'
        }`}
        aria-hidden="true"
      />
      <span className={`font-mono text-xs ${connected ? 'text-status-nominal' : 'text-status-critical'}`}>
        {label}
      </span>
    </div>
  );
}
