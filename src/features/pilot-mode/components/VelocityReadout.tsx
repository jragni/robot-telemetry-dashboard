import { HudPanel } from './HudPanel';
import type { VelocityReadoutProps } from './PilotHud.types';

export function VelocityReadout({
  linearVelocity,
  angularVelocity,
}: VelocityReadoutProps) {
  return (
    <HudPanel
      data-testid="hud-velocity-readout"
      className="flex flex-col gap-1"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          LIN
        </span>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {linearVelocity.toFixed(1)}
          <span className="text-[10px] text-muted-foreground"> m/s</span>
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          ANG
        </span>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {angularVelocity.toFixed(1)}
          <span className="text-[10px] text-muted-foreground"> r/s</span>
        </span>
      </div>
    </HudPanel>
  );
}
