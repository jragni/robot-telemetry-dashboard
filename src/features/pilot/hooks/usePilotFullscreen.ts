import { useState, useEffect, useCallback } from 'react';
import type { UsePilotFullscreenReturn } from './usePilotFullscreen.types';

/** usePilotFullscreen
 * @description Manages fullscreen toggle state for the pilot view with Escape key support.
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
        const el = e.target instanceof HTMLElement ? e.target : null;
        if (el?.getAttribute('contenteditable') === 'true') return;
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
