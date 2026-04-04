import { useState, useEffect, useCallback } from 'react';
import type { UsePilotFullscreenReturn } from '../types/usePilotFullscreen.types';

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
        const isContentEditable = e.target instanceof HTMLElement && e.target.getAttribute('contenteditable') === 'true';
        if (isContentEditable) return;
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
