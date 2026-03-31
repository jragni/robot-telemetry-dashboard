import { Camera } from 'lucide-react';
import type { CameraPanelProps } from '@/features/workspace/types/CameraPanel.types';

/** CameraPanel
 * @description Renders a camera feed panel. Currently shows the empty "No stream"
 *  state. When WebRTC is integrated, will display live video with frozen-frame
 *  fallback on disconnect.
 * @param connected - Whether the robot is currently connected.
 * @param label - Optional topic name to display in the empty state.
 */
export function CameraPanel({ connected, label }: CameraPanelProps) {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      aria-label="Camera feed — no stream"
    >
      <div className="flex flex-col items-center gap-2">
        <Camera className="size-8 text-text-muted opacity-30" aria-hidden="true" />
        <span className="font-mono text-xs text-text-muted">
          {connected ? 'No stream' : 'Disconnected'}
        </span>
        {label ? <span className="font-mono text-xs text-text-secondary">{label}</span> : null}
      </div>
    </div>
  );
}
