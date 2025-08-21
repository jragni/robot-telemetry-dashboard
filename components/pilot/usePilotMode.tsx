'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

interface PilotModeContextType {
  isPilotMode: boolean;
  togglePilotMode: () => void;
  exitPilotMode: () => void;
  enterPilotMode: () => void;
  orientation: 'portrait' | 'landscape';
  isFullscreen: boolean;
}

const PilotModeContext = createContext<PilotModeContextType | undefined>(undefined);

export function PilotModeProvider({ children }: { children: ReactNode }) {
  const [isPilotMode, setIsPilotMode] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterPilotMode = useCallback(async () => {
    try {
      // On mobile, try to lock screen orientation to current or preferred orientation
      if ('screen' in window && 'orientation' in window.screen && 'lock' in window.screen.orientation) {
        try {
          // Try to lock to landscape first (better for pilot mode), fallback to current
          const landscapePromise = (window.screen.orientation as any).lock('landscape');
          if (landscapePromise && typeof landscapePromise.catch === 'function') {
            await landscapePromise.catch(() => {
              const anyPromise = (window.screen.orientation as any).lock('any');
              return anyPromise && typeof anyPromise.catch === 'function' ? anyPromise : Promise.resolve();
            });
          }
        } catch (orientationError) {
          console.warn('Screen orientation lock not supported:', orientationError);
        }
      }

      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // Fallback for mobile browsers that don't support fullscreen API
        setIsFullscreen(false);
      }

      setIsPilotMode(true);
    } catch (error) {
      console.warn('Failed to enter fullscreen:', error);
      // Still enable pilot mode even if fullscreen fails
      setIsPilotMode(true);
      setIsFullscreen(false);
    }
  }, []);

  const exitPilotMode = useCallback(async () => {
    try {
      // Unlock screen orientation
      if ('screen' in window && 'orientation' in window.screen && 'unlock' in window.screen.orientation) {
        try {
          (window.screen.orientation as any).unlock();
        } catch (orientationError) {
          console.warn('Screen orientation unlock failed:', orientationError);
        }
      }

      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
      }

      setIsPilotMode(false);
      setIsFullscreen(false);
    } catch (error) {
      console.warn('Failed to exit fullscreen:', error);
      // Still exit pilot mode even if fullscreen fails
      setIsPilotMode(false);
      setIsFullscreen(false);
    }
  }, []);

  const togglePilotMode = useCallback(() => {
    if (isPilotMode) {
      exitPilotMode();
    } else {
      enterPilotMode();
    }
  }, [isPilotMode, enterPilotMode, exitPilotMode]);

  // Handle orientation changes
  useEffect(() => {
    const updateOrientation = () => {
      if (window.matchMedia('(orientation: landscape)').matches) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    // Set initial orientation
    updateOrientation();

    // Listen for orientation changes
    const orientationMediaQuery = window.matchMedia('(orientation: landscape)');
    orientationMediaQuery.addEventListener('change', updateOrientation);

    return () => {
      orientationMediaQuery.removeEventListener('change', updateOrientation);
    };
  }, []);

  // Handle escape key to exit pilot mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPilotMode) {
        exitPilotMode();
      }
    };

    // Handle fullscreen change events
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && isPilotMode) {
        setIsPilotMode(false);
      }
    };

    // Handle visibility change (for mobile browsers that exit fullscreen when switching apps)
    const handleVisibilityChange = () => {
      if (document.hidden && isPilotMode) {
        // Don't exit pilot mode on visibility change, just update fullscreen state
        setIsFullscreen(!!document.fullscreenElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPilotMode, exitPilotMode]);

  return (
    <PilotModeContext.Provider value={{
      isPilotMode,
      togglePilotMode,
      exitPilotMode,
      enterPilotMode,
      orientation,
      isFullscreen,
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