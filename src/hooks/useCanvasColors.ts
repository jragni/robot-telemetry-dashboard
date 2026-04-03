import { useState } from 'react';

import { useThemeChange } from '@/hooks/useThemeChange';

/** resolveTokens
 * @description Resolves CSS custom property values from a DOM element.
 * @param tokenMap - Maps local color keys to CSS custom property names.
 * @param el - DOM element for getComputedStyle.
 * @returns Resolved color values keyed by the same keys as tokenMap.
 */
function resolveTokens<T extends Record<string, string>>(
  tokenMap: T,
  el: Element,
): Record<keyof T, string> {
  const style = getComputedStyle(el);
  const resolved = {} as Record<string, string>;

  for (const [key, token] of Object.entries(tokenMap)) {
    const value = style.getPropertyValue(token).trim();
    resolved[key] = value || token;
  }

  return resolved as Record<keyof T, string>;
}

/** useCanvasColors
 * @description Manages theme-aware color resolution for Canvas 2D components.
 *  Resolves CSS custom properties via getComputedStyle and re-resolves when
 *  the theme changes. Returns a stable colors object and a themeVersion
 *  counter for triggering canvas redraws.
 * @param tokenMap - Maps local color keys to CSS custom property names
 *  (e.g., `{ accent: '--color-accent' }`).
 * @param elementRef - Optional ref to a mounted DOM element for
 *  getComputedStyle. Falls back to document.documentElement when the ref
 *  is absent or its current value is null (e.g., before the first render).
 * @returns An object with resolved `colors` (same keys as tokenMap) and
 *  `themeVersion` counter that increments on theme changes.
 */
export function useCanvasColors<T extends Record<string, string>>(
  tokenMap: T,
  elementRef?: React.RefObject<Element | null>,
): { colors: Record<keyof T, string>; themeVersion: number } {
  const [themeVersion, setThemeVersion] = useState(0);
  const [colors, setColors] = useState<Record<keyof T, string>>(() =>
    resolveTokens(tokenMap, elementRef?.current ?? document.documentElement),
  );

  useThemeChange(() => {
    setThemeVersion((v) => v + 1);
    const el = elementRef?.current ?? document.documentElement;
    setColors(resolveTokens(tokenMap, el));
  });

  return { colors, themeVersion };
}
