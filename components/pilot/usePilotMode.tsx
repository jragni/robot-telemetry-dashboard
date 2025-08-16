'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface PilotModeContextType {
  isPilotMode: boolean;
  togglePilotMode: () => void;
  exitPilotMode: () => void;
  enterPilotMode: () => void;
}

const PilotModeContext = createContext<PilotModeContextType | undefined>(undefined);

export function PilotModeProvider({ children }: { children: ReactNode }) {
  const [isPilotMode, setIsPilotMode] = useState(false);

  const enterPilotMode = useCallback(async () => {
    try {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsPilotMode(true);
    } catch (error) {
      console.warn('Failed to enter fullscreen:', error);
      // Still enable pilot mode even if fullscreen fails
      setIsPilotMode(true);
    }
  }, []);

  const exitPilotMode = useCallback(async () => {
    try {
      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsPilotMode(false);
    } catch (error) {
      console.warn('Failed to exit fullscreen:', error);
      // Still exit pilot mode even if fullscreen fails
      setIsPilotMode(false);
    }
  }, []);

  const togglePilotMode = useCallback(() => {
    if (isPilotMode) {
      exitPilotMode();
    } else {
      enterPilotMode();
    }
  }, [isPilotMode, enterPilotMode, exitPilotMode]);

  // Handle escape key to exit pilot mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPilotMode) {
        exitPilotMode();
      }
    };

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isPilotMode) {
        setIsPilotMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isPilotMode, exitPilotMode]);

  return (
    <PilotModeContext.Provider value={{
      isPilotMode,
      togglePilotMode,
      exitPilotMode,
      enterPilotMode,
    }}>
      {children}
    </PilotModeContext.Provider>
  );
}

export function usePilotMode() {
  const context = useContext(PilotModeContext);
  if (context === undefined) {
    throw new Error('usePilotMode must be used within a PilotModeProvider');
  }
  return context;
}