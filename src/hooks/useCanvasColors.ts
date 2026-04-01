import { useRef, useState, useCallback } from 'react';
import { useThemeChange } from '@/hooks/useThemeChange';

/** TokenMapping
 * @description Maps local color keys to CSS custom property names.
 */
type TokenMapping = Record<string, string>;

/** useCanvasColors
 * @description Manages theme-aware color resolution for Canvas 2D components.
 *  Initializes from fallback values, resolves CSS custom properties on first
 *  render, and re-resolves when the theme changes. Returns a stable ref to
 *  the resolved colors and a themeVersion counter for triggering canvas redraws.
 * @param fallbacks - Initial fallback color values keyed by local name.
 * @param tokenMap - Maps local color keys to CSS custom property names
 *  (e.g., `{ accent: '--color-accent' }`).
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
        const value = style.getPropertyValue(tokenMap[key]).trim();
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
