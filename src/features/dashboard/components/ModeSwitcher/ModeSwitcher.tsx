import { useModeStore } from '../../stores/modeStore';

import type { ModeButtonConfig, ModeSwitcherProps } from './ModeSwitcher.types';

const ALL_MODES: ModeButtonConfig[] = [
  { mode: 'dashboard', label: 'Dashboard' },
  { mode: 'pilot', label: 'Pilot' },
  { mode: 'engineer', label: 'Engineer' },
];

const MOBILE_MODES: ModeButtonConfig[] = [
  { mode: 'dashboard', label: 'Dashboard' },
  { mode: 'pilot', label: 'Pilot' },
];

export function ModeSwitcher({ isMobile = false }: ModeSwitcherProps) {
  const { currentMode, switchMode } = useModeStore();
  const modes = isMobile ? MOBILE_MODES : ALL_MODES;

  return (
    <nav aria-label="Mode Switcher">
      <div className="flex gap-1">
        {modes.map(({ mode, label }) => {
          const isActive = currentMode === mode;
          return (
            <button
              key={mode}
              type="button"
              aria-pressed={isActive}
              onClick={() => switchMode(mode)}
              className={[
                'rounded px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              ].join(' ')}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
