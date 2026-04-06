import { useWebRtcStream } from '@/hooks';
import { CameraEmptyState } from '@/components/CameraEmptyState';

import type { CameraPanelProps } from './CameraPanel.types';

/** CameraPanel
 * @description Renders a camera feed panel with self-managed WebRTC stream.
 *  Calls useWebRtcStream internally to own its video connection lifecycle.
 *  Shows the video element when connected, otherwise displays the empty state.
 * @prop connected - Whether the robot is currently connected.
 * @prop robotUrl - Base URL of the robot for WebRTC signaling.
 * @prop label - Optional topic name to display in the empty state.
 */
export function CameraPanel({ connected, label, robotUrl }: CameraPanelProps) {
  const { videoRef } = useWebRtcStream({ connected, enabled: connected, url: robotUrl });

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      aria-label={connected ? 'Camera feed' : 'Camera feed — no stream'}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-contain"
      />
      {!connected && <CameraEmptyState label={label} message="Disconnected" />}
    </div>
  );
}
