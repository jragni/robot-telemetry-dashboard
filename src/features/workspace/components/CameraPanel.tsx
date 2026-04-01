import { Camera } from 'lucide-react';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { CameraPanelProps } from '@/features/workspace/types/CameraPanel.types';

/** CameraPanel
 * @description Renders a camera feed panel. Displays live video via WebRTC
 *  when a stream ref is provided, otherwise shows the empty state.
 * @param streamRef - Ref to attach the video MediaStream to.
 * @param connected - Whether the robot is currently connected.
 * @param label - Optional topic name to display in the empty state.
 */
export function CameraPanel({ streamRef, connected, label }: CameraPanelProps) {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      aria-label={streamRef ? 'Camera feed' : 'Camera feed — no stream'}
    >
      <ConditionalRender
        shouldRender={!!streamRef}
        Component={
          <video
            ref={streamRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-contain"
          />
        }
      />
      <ConditionalRender
        shouldRender={!streamRef}
        Component={
          <div className="flex flex-col items-center gap-2">
            <Camera className="size-8 text-text-muted opacity-30" aria-hidden="true" />
            <span className="font-mono text-xs text-text-muted">
              {connected ? 'No stream' : 'Disconnected'}
            </span>
            {label ? <span className="font-mono text-xs text-text-secondary">{label}</span> : null}
          </div>
        }
      />
    </div>
  );
}
