import { useRef, useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';

import type { VideoFeedProps, VideoFeedStatus } from './VideoFeed.types';

import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Show } from '@/components/shared/Show';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { useObservable } from '@/hooks/useObservable';
import { cn } from '@/lib/utils';
import { webRTCServiceRegistry } from '@/services/webrtc/registry/WebRTCServiceRegistry';
import { useConnectionsStore } from '@/stores/connections/connections.store';
import { useWebRTCStore } from '@/stores/webrtc/webrtc.store';
import type { ConnectionState } from '@/types/connection.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Derives a VideoFeedStatus from the current connection state and whether a
 * MediaStream is present.
 */
function deriveStatus(
  connectionState: ConnectionState,
  hasStream: boolean
): VideoFeedStatus {
  if (connectionState === 'connected' && hasStream) return 'streaming';
  if (connectionState === 'connecting') return 'connecting';
  if (connectionState === 'error') return 'error';
  return 'disconnected';
}

/**
 * Maps VideoFeedStatus to the ConnectionState expected by StatusIndicator.
 */
function statusToConnectionState(status: VideoFeedStatus): ConnectionState {
  switch (status) {
    case 'streaming':
      return 'connected';
    case 'connecting':
      return 'connecting';
    case 'error':
      return 'error';
    default:
      return 'disconnected';
  }
}

// Stable fallback observable so useObservable never receives undefined.
const NULL_STREAM$ = new BehaviorSubject<MediaStream | null>(null);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VideoFeed({
  robotId,
  className,
  showStatusOverlay = true,
  muted = true,
  onStreamStart,
  onStreamEnd,
  children,
}: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get the robot's base URL from the connections store.
  const baseUrl = useConnectionsStore((state) => {
    const robot = state.robots.find((r) => r.id === robotId);
    return robot?.baseUrl ?? '';
  });

  // Read connection state from the WebRTC store.
  const connectionState = useWebRTCStore((state) =>
    state.getConnectionState(robotId)
  );

  // Connect on mount, disconnect on unmount.
  useEffect(() => {
    webRTCServiceRegistry.connect(robotId, baseUrl);
    return () => {
      webRTCServiceRegistry.disconnect(robotId);
    };
    // baseUrl is intentionally excluded — we only want to connect once per
    // mount with the URL that was available at mount time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [robotId]);

  // Obtain the media stream observable from the transport.
  const mediaStream$ = (() => {
    try {
      return webRTCServiceRegistry.getTransport(robotId).getMediaStream$();
    } catch {
      return NULL_STREAM$;
    }
  })();

  const mediaStream = useObservable<MediaStream | null>(mediaStream$, null);

  // Bind the MediaStream to the video element when it changes.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.srcObject !== mediaStream) {
      video.srcObject = mediaStream;
    }
  }, [mediaStream]);

  // Fire lifecycle callbacks when stream presence changes.
  useEffect(() => {
    if (mediaStream) {
      onStreamStart?.();
    } else {
      onStreamEnd?.();
    }
  }, [mediaStream, onStreamStart, onStreamEnd]);

  const status = deriveStatus(connectionState, mediaStream !== null);
  const indicatorState = statusToConnectionState(status);

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden bg-black',
        className
      )}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover"
      >
        {/* No audio track — captions are not applicable for a robot camera feed */}
        <track kind="captions" src="" default />
      </video>

      {/* Status overlay */}
      <Show when={showStatusOverlay && status !== 'streaming'}>
        <div
          data-testid="video-status-overlay"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60"
        >
          <Show when={status === 'connecting'}>
            <LoadingSpinner size="lg" className="text-status-degraded" />
          </Show>

          <StatusIndicator
            state={indicatorState}
            label={status.toUpperCase()}
          />

          {/* Connection badge */}
          <span className="absolute bottom-2 right-2">
            <StatusIndicator state={indicatorState} />
          </span>
        </div>
      </Show>

      {/* Streaming badge — always visible so operators have continuous confirmation */}
      <Show when={status === 'streaming' && showStatusOverlay}>
        <div
          data-testid="video-status-overlay"
          className="absolute bottom-2 right-2"
        >
          <StatusIndicator state="connected" label="LIVE" />
        </div>
      </Show>

      {children}
    </div>
  );
}
