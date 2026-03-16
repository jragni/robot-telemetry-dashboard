import type { HudPanelProps } from './PilotHud.types';

import { cn } from '@/lib/utils';

/** Semi-transparent HUD panel wrapper for consistent styling. */
export function HudPanel({
  children,
  className,
  'data-testid': testId,
}: HudPanelProps) {
  return (
    <div
      data-testid={testId}
      className={cn(
        'rounded border border-border/40 bg-black/60 px-3 py-2 backdrop-blur-sm',
        className
      )}
    >
      {children}
    </div>
  );
}
