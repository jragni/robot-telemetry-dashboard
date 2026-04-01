import { Radio, Camera, WifiOff } from 'lucide-react';

/** EmptyStates
 * @description Renders standalone empty state patterns: fleet empty state and
 *  panel disconnected states. These are visual recreations to avoid importing
 *  components with modal dependencies.
 */
export function EmptyStates() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <article className="border border-border rounded-sm bg-surface-secondary p-6 flex flex-col items-center gap-4">
        <Radio className="size-8 text-accent opacity-30" aria-hidden="true" />
        <h3 className="font-sans text-sm font-semibold text-text-primary">No Robots Configured</h3>
        <p className="font-sans text-xs text-text-muted text-center leading-relaxed">
          Add your first robot to begin monitoring. Connect to any ROS2 robot running rosbridge.
        </p>
        <span className="font-mono text-xs text-text-muted">Fleet empty state</span>
      </article>

      <article className="border border-border rounded-sm bg-surface-secondary p-6 flex flex-col items-center gap-4">
        <Camera className="size-8 text-text-muted opacity-30" aria-hidden="true" />
        <span className="font-mono text-xs text-text-muted">Disconnected</span>
        <span className="font-mono text-xs text-text-secondary">Camera panel empty</span>
      </article>

      <article className="border border-border rounded-sm bg-surface-secondary p-6 flex flex-col items-center gap-4 opacity-50">
        <WifiOff className="size-8 text-status-offline" aria-hidden="true" />
        <span className="font-mono text-xs text-status-offline">DISCONNECTED</span>
        <span className="font-mono text-xs text-text-secondary">Panel offline state</span>
      </article>
    </div>
  );
}
