import { BarChart3, Hash } from 'lucide-react';

import type { ViewToggleProps } from './ImuWidget.types';

export function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  const isDigital = viewMode === 'digital';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDigital ? 'Switch to plot view' : 'Switch to digital view'}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {isDigital ? (
        <>
          <BarChart3 className="h-3 w-3" aria-hidden="true" />
          Plot
        </>
      ) : (
        <>
          <Hash className="h-3 w-3" aria-hidden="true" />
          Digital
        </>
      )}
    </button>
  );
}
