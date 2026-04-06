import { CameraEmptyState } from '@/components/CameraEmptyState';
import type { CameraPanelProps } from './CameraPanel.types';

/** CameraPanel
 * @description Renders a camera feed panel. Displays live video via WebRTC
 *  when a stream ref is provided, otherwise shows the empty state.
 * @param streamRef - Ref to attach the video MediaStream to.
 * @param connected - Whether the robot is currently connected.
 * @param label - Optional topic name to display in the empty state.
 */
export function CameraPanel({ connected, label, streamRef }: CameraPanelProps) {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      aria-label={streamRef ? 'Camera feed' : 'Camera feed — no stream'}
    >
      {streamRef ? (
          <video
            ref={streamRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-contain"
          />
      ) : (
          <CameraEmptyState
            label={label}
            message={connected ? 'No stream' : 'Disconnected'}
          />
      )}
    </div>
  );
}
