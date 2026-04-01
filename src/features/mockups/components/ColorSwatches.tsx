import { useState, useEffect, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLOR_TOKEN_GROUPS } from '../constants';

/** ColorSwatches
 * @description Renders design system color tokens grouped by namespace. Each
 *  swatch shows the resolved color value via getComputedStyle. Includes a local
 *  theme toggle that applies data-theme on the wrapper div without affecting
 *  the global theme.
 */
export function ColorSwatches() {
  const [localTheme, setLocalTheme] = useState<'dark' | 'light'>('dark');
  const [resolvedColors, setResolvedColors] = useState<Record<string, string>>({});

  const resolveColors = useCallback(() => {
    const el = document.getElementById('color-swatches-root');
    if (!el) return;
    const styles = getComputedStyle(el);
    const colors: Record<string, string> = {};
    for (const group of COLOR_TOKEN_GROUPS) {
      for (const token of group.tokens) {
        colors[token] = styles.getPropertyValue(token).trim();
      }
    }
    setResolvedColors(colors);
  }, []);

  useEffect(() => {
    // Delay to allow data-theme attribute to take effect
    const timer = setTimeout(resolveColors, 50);
    return () => {
      clearTimeout(timer);
    };
  }, [localTheme, resolveColors]);

  const toggleTheme = useCallback(() => {
    setLocalTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <div id="color-swatches-root" data-theme={localTheme} className="bg-surface-base rounded-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <span className="font-sans text-sm font-semibold text-text-primary">
          Theme: {localTheme}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${localTheme === 'dark' ? 'light' : 'dark'} theme`}
          className="cursor-pointer transition"
        >
          {localTheme === 'dark' ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
          <span className="font-sans text-xs ml-1.5">
            {localTheme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </Button>
      </div>

      <div className="flex flex-col gap-6">
        {COLOR_TOKEN_GROUPS.map((group) => (
          <div key={group.namespace}>
            <h3 className="font-sans text-sm font-semibold text-text-secondary mb-2">
              {group.namespace}
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {group.tokens.map((token) => (
                <div key={token} className="flex flex-col gap-1">
                  <div
                    className="h-12 rounded-sm border border-border"
                    style={{ backgroundColor: resolvedColors[token] ?? 'transparent' }}
                  />
                  <span className="font-mono text-xs text-text-muted truncate" title={token}>
                    {token.replace('--color-', '')}
                  </span>
                  <span className="font-mono text-xs text-text-secondary truncate">
                    {resolvedColors[token] ?? '...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
