import { HudPanel } from './HudPanel';
import type { BatteryIndicatorProps } from './PilotHud.types';

import { cn } from '@/lib/utils';

export function BatteryIndicator({ batteryPercentage }: BatteryIndicatorProps) {
  const isLow = batteryPercentage < 20;
  const isCritical = batteryPercentage < 10;

  return (
    <HudPanel
      data-testid="hud-battery-indicator"
      className="flex items-center gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        BAT
      </span>
      <span
        className={cn(
          'font-mono text-sm tabular-nums',
          isCritical
            ? 'text-status-critical'
            : isLow
              ? 'text-status-degraded'
              : 'text-status-nominal'
        )}
      >
        {batteryPercentage}%
      </span>
    </HudPanel>
  );
}
