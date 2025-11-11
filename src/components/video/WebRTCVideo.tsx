/**
 * WebRTCVideo Component
 *
 * Displays WebRTC video stream from robot camera
 */

import { useEffect, useRef } from 'react';

import { useRosContext } from '@/contexts/ros/RosContext';
import { useWebRTCContext } from '@/contexts/webrtc/WebRTCContext';

function WebRTCVideo() {
  const { activeRobot } = useRosContext();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get shared WebRTC connection from context
  const { stream, connectionState, error } = useWebRTCContext();

  // Attach stream to video element when available
  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('WebRTCVideo: Attaching stream to video element', {
        streamId: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length,
        videoTrackActive: stream.getVideoTracks()[0]?.enabled,
      });
      videoRef.current.srcObject = stream;

      // Ensure video plays (in case autoPlay fails)
      videoRef.current.play().catch((err) => {
        console.warn('WebRTCVideo: Failed to auto-play video:', err);
      });
    }
  }, [stream]);

  const isConnected = connectionState === 'connected' && stream !== null;
  const isConnecting =
    connectionState === 'connecting' || connectionState === 'reconnecting';

  return (
    <div className="relative min-h-[300px] w-full aspect-video lg:aspect-auto lg:h-full bg-card border border-border rounded-sm overflow-hidden">
      {/* Video Element */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-contain ${
            isConnected ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        />
      )}

      {/* Placeholder when disconnected or connecting */}
      {!isConnected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-muted-foreground">
            {isConnecting ? (
              <svg
                className="w-20 h-20 mb-4 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            ) : (
              <svg
                className="w-20 h-20 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>

          {isConnecting && (
            <>
              <p className="text-muted-foreground text-sm font-mono tracking-wider">
                CONNECTING TO VIDEO
              </p>
              <p className="text-muted-foreground/70 text-xs font-mono mt-1">
                {connectionState.toUpperCase()}
              </p>
            </>
          )}

          {connectionState === 'disconnected' && !activeRobot && (
            <>
              <p className="text-muted-foreground text-sm font-mono tracking-wider">
                NO ROBOT SELECTED
              </p>
              <p className="text-muted-foreground/70 text-xs font-mono mt-1">
                SELECT A ROBOT TO VIEW VIDEO
              </p>
            </>
          )}

          {connectionState === 'disconnected' && activeRobot && (
            <>
              <p className="text-muted-foreground text-sm font-mono tracking-wider">
                VIDEO FEED OFFLINE
              </p>
              <p className="text-muted-foreground/70 text-xs font-mono mt-1">
                WEBRTC NOT CONNECTED
              </p>
            </>
          )}

          {connectionState === 'error' && (
            <>
              <p className="text-destructive text-sm font-mono tracking-wider">
                VIDEO CONNECTION ERROR
              </p>
              {error && (
                <p className="text-destructive/70 text-xs font-mono mt-1 max-w-xs text-center px-4">
                  {error.message}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-3 left-3">
        <div className="flex items-center gap-2 bg-background/80 px-2 py-1 rounded-sm border border-border backdrop-blur-sm">
          <div
            className={`h-1.5 w-1.5 rounded-full ${
              isConnected
                ? 'bg-green-500 animate-pulse'
                : isConnecting
                  ? 'bg-yellow-500 animate-pulse'
                  : connectionState === 'error'
                    ? 'bg-red-500'
                    : 'bg-muted'
            }`}
          />
          <span className="text-xs font-mono text-gray-900 dark:text-[#E8E8E8]">
            {isConnected ? 'LIVE' : isConnecting ? 'CONNECTING' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Camera Label */}
      {isConnected && (
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-xs font-mono text-gray-900 dark:text-[#E8E8E8]">
          <div className="bg-background/80 px-2 py-1 rounded-sm border border-border backdrop-blur-sm">
            <span>{activeRobot?.name ?? 'CAM-01'}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebRTCVideo;
