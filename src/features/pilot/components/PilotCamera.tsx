import { Camera } from 'lucide-react';
import { ConditionalRender } from '@/components/ConditionalRender';
import { VIDEO_STATUS_LABELS } from '../constants';
import type { PilotCameraProps } from '../types/PilotView.types';

/** PilotCamera
 * @description Renders the full-bleed camera background for Pilot Mode.
 *  Displays a video element when streaming, or an empty state with status
 *  text when idle/connecting/failed. The video fills the entire container
 *  with object-cover sizing.
 * @param videoStatus - Current WebRTC stream connection status.
 * @param videoRef - Ref to attach the MediaStream to the video element.
 */
export function PilotCamera({ videoStatus, videoRef }: PilotCameraProps) {
  const isStreaming = videoStatus === 'streaming';

  return (
    <div className="absolute inset-0" aria-label="Camera feed">
      <ConditionalRender
        shouldRender={isStreaming}
        Component={
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        }
      />

      <ConditionalRender
        shouldRender={!isStreaming}
        Component={
          <div className="absolute inset-0 flex items-center justify-center bg-surface-base">
            <div className="flex flex-col items-center gap-3">
              <Camera className="size-12 text-text-muted" aria-hidden="true" />
              <p className="font-mono text-sm text-text-muted">
                {videoStatus !== 'streaming' ? VIDEO_STATUS_LABELS[videoStatus] : ''}
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
