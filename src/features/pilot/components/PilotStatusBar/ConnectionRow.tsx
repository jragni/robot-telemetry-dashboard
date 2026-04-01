import type { ConnectionRowProps } from '../../types/PilotStatusBar.types';

/** ConnectionRow
 * @description Renders a connection status row with animated dot indicator
 *  and label. Uses breathe-pulse animation when connected.
 * @param label - Short label for the connection type (e.g., "ROS").
 * @param connected - Whether the connection is active.
 */
export function ConnectionRow({ label, connected }: ConnectionRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-sans text-xs text-text-muted">{label}</span>
      <div className="flex items-center gap-1.5">
        <span
          className={`size-1.5 rounded-full ${
            connected
              ? 'bg-status-nominal motion-safe:animate-pulse'
              : 'bg-status-critical'
          }`}
          aria-hidden="true"
        />
        <span className={`font-mono text-xs ${connected ? 'text-status-nominal' : 'text-status-critical'}`}>
          {connected ? 'OK' : 'OFF'}
        </span>
      </div>
    </div>
  );
}
