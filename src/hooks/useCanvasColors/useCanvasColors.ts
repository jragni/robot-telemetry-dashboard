import { useRef, useState, useCallback } from 'react';
import { useThemeChange } from '@/hooks/useThemeChange';

type TokenMapping = Record<string, string>;

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
