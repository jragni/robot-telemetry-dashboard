import { CameraEmptyState } from '@/components/CameraEmptyState';

import { VIDEO_STATUS_LABELS } from '../constants';
import type { PilotCameraProps } from '../types/PilotPage.types';

/** PilotCamera
 * @description Renders the full-bleed camera background for Pilot Mode.
 *  Displays a video element when streaming, or an empty state with status
 *  text when idle/connecting/failed. The video fills the entire container
 *  with object-cover sizing.
 * @prop videoStatus - Current WebRTC stream connection status.
 * @prop videoRef - Ref to attach the MediaStream to the video element.
 */
export function PilotCamera({ videoRef, videoStatus }: PilotCameraProps) {
  const isStreaming = videoStatus === 'streaming';

  return (
    <div className="absolute inset-0" aria-label="Camera feed">
      {isStreaming ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-base">
          <CameraEmptyState message={VIDEO_STATUS_LABELS[videoStatus]} variant="hero" />
        </div>
      )}
    </div>
  );
}
