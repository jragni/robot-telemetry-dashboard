import { useEffect, useRef } from 'react';

import { useWebRTCContext } from '@/contexts/webrtc/WebRTCContext';

function PilotVideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, connectionState } = useWebRTCContext();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('PilotVideoFeed: Failed to auto-play video:', err);
      });
    }
  }, [stream]);

  const isConnected = connectionState === 'connected' && stream !== null;

  return (
    <div className="w-full h-full bg-background relative">
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-contain ${
            isConnected ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        />
      )}

      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="text-muted-foreground text-sm font-mono">
            {connectionState === 'connecting' ||
            connectionState === 'reconnecting'
              ? 'CONNECTING...'
              : 'NO VIDEO'}
          </div>
        </div>
      )}
    </div>
  );
}

export default PilotVideoFeed;
