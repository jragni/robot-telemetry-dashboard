import { useRef, useState, useCallback } from 'react';
import { useThemeChange } from '@/hooks';
import type { TokenMapping } from './useCanvasColors.types';

/** useCanvasColors
 * @description Resolves CSS custom properties into concrete color strings for Canvas 2D rendering.
 *  Re-resolves on theme change via MutationObserver.
 * @param fallbacks - Default color values keyed by token name.
 * @param tokenMap - Maps keys to CSS custom property names.
 */
export function useCanvasColors<T extends Record<string, string>>(
  fallbacks: T,
  tokenMap: TokenMapping,
): { colorsRef: React.RefObject<T>; themeVersion: number; resolveColors: () => void } {
  const colorsRef = useRef({ ...fallbacks });
  const colorsResolved = useRef(false);
  const [themeVersion, setThemeVersion] = useState(0);

  useThemeChange(() => {
    colorsResolved.current = false;
    setThemeVersion((v) => v + 1);
  });

  const resolveColors = useCallback(() => {
    if (colorsResolved.current) return;
    const style = getComputedStyle(document.documentElement);
    const resolved = { ...colorsRef.current };

    for (const key of Object.keys(tokenMap)) {
      if (key in resolved) {
        const token = tokenMap[key];
        if (!token) continue;
        const value = style.getPropertyValue(token).trim();
        if (value) {
          (resolved as Record<string, string>)[key] = value;
        }
      }
    }

    colorsRef.current = resolved;
    colorsResolved.current = true;
  }, [tokenMap]);

  return { colorsRef, themeVersion, resolveColors };
}
