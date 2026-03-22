import { useEffect, useState } from 'react';

const THEMES = [{ value: 'default-dark', label: 'Default Dark' }] as const;

type ThemeValue = (typeof THEMES)[number]['value'];

export function ThemeDropdown() {
  const [theme, setTheme] = useState<ThemeValue>('default-dark');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <label
        htmlFor="theme-select"
        className="text-xs text-muted-foreground shrink-0"
      >
        Theme
      </label>
      <select
        id="theme-select"
        aria-label="Theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeValue)}
        className="flex-1 rounded border border-border bg-background px-1 py-0.5 text-xs text-foreground"
      >
        {THEMES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}
