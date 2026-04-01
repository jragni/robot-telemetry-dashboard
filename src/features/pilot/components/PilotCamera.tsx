import { Camera } from 'lucide-react';
import { ConditionalRender } from '@/components/ConditionalRender';
import type { PilotCameraProps } from '../types/PilotView.types';

/** STATUS_LABELS
 * @description Maps video stream status to user-facing labels.
 */
const STATUS_LABELS: Record<string, string> = {
  idle: 'No video stream',
  connecting: 'Connecting...',
  failed: 'Stream failed',
};

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
                {STATUS_LABELS[videoStatus] ?? 'No video stream'}
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
