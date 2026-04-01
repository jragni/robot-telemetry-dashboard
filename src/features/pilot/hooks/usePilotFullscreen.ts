import { useState, useEffect, useCallback } from 'react';
import type { UsePilotFullscreenReturn } from '../types/usePilotFullscreen.types';

/** usePilotFullscreen
 * @description Manages fullscreen toggle state for Pilot Mode. Binds F key
 *  to toggle and Escape to exit fullscreen. Document-level listeners ensure
 *  Escape exits fullscreen before reaching panel-scoped E-STOP handlers.
 */
export function usePilotFullscreen(): UsePilotFullscreenReturn {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'f' || e.key === 'F') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      }

      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault();
        e.stopPropagation();
        setIsFullscreen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isFullscreen]);

  return { isFullscreen, toggleFullscreen, exitFullscreen };
}
