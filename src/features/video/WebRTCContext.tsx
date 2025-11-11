/**
 * WebRTCContext
 *
 * Global context provider for WebRTC connection management.
 * Manages a single WebRTC connection shared across all video components.
 */

import { createContext, useContext, useEffect } from 'react';

import { useRosContext } from '@/features/ros/RosContext';
import { useWebRTC } from '@/hooks/useWebRTC';
import type { WebRTCConnectionState } from '@/types/webrtc';

interface WebRTCContextValue {
  stream: MediaStream | null;
  connectionState: WebRTCConnectionState;
  error: Error | null;
}

const WebRTCContext = createContext<WebRTCContextValue | undefined>(undefined);

interface WebRTCProviderProps {
  children: React.ReactNode;
}

export function WebRTCProvider({ children }: WebRTCProviderProps) {
  const { webrtcUrl, activeRobot } = useRosContext();

  // Single WebRTC connection for the entire app
  const { stream, connectionState, error, connect } = useWebRTC({
    url: webrtcUrl,
    autoConnect: false,
  });

  // Auto-connect when robot is selected
  useEffect(() => {
    if (activeRobot?.id && webrtcUrl) {
      console.log(
        'WebRTCProvider: Initiating connection for robot',
        activeRobot.id
      );
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRobot?.id, webrtcUrl]);

  const value: WebRTCContextValue = {
    stream,
    connectionState,
    error,
  };

  return (
    <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
  );
}

export function useWebRTCContext() {
  const context = useContext(WebRTCContext);
  if (context === undefined) {
    throw new Error('useWebRTCContext must be used within a WebRTCProvider');
  }
  return context;
}
