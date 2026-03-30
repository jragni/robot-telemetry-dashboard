import { useState, useEffect, useCallback } from 'react';

type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  // Default to dark — defense dashboard aesthetic
  return 'dark';
}

/**
 * Manages dark/light theme state with localStorage persistence and system preference sync.
 * @returns The current theme, a setter function, and a toggle function.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Set data-theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync with system preference changes (only if no stored preference)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    function handler(e: MediaQueryListEvent) {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    }
    mq.addEventListener('change', handler);
    return () => {
      mq.removeEventListener('change', handler);
    };
  }, [setTheme]);

  return { theme, setTheme, toggle } as const;
}
