/**
 * WebRTCContext
 *
 * Global context provider for WebRTC connection management.
 * Manages a single WebRTC connection shared across all video components.
 */

import { createContext, useContext } from 'react';

import type { WebRTCContextValue, WebRTCProviderProps } from './definitions';

import { useRosContext } from '@/contexts/ros/RosContext';
import { useWebRTC } from '@/hooks/webrtc/useWebRTC';

const WebRTCContext = createContext<WebRTCContextValue | undefined>(undefined);

export function WebRTCProvider({ children }: WebRTCProviderProps) {
  const { webrtcUrl } = useRosContext();

  // Single WebRTC connection for the entire app
  const { stream, connectionState, error, connect, disconnect } = useWebRTC({
    url: webrtcUrl,
    autoConnect: false,
  });

  const value: WebRTCContextValue = {
    stream,
    connectionState,
    error,
    connect,
    disconnect,
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
