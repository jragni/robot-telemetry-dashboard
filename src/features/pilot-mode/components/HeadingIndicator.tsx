import { HudPanel } from './HudPanel';
import type { HeadingIndicatorProps } from './PilotHud.types';

/** Format degrees to a 3-digit zero-padded string with a degree symbol. */
function formatHeading(deg: number): string {
  const normalised = ((deg % 360) + 360) % 360;
  return `${Math.round(normalised).toString().padStart(3, '0')}°`;
}

export function HeadingIndicator({ heading }: HeadingIndicatorProps) {
  return (
    <HudPanel
      data-testid="hud-heading-indicator"
      className="flex items-center gap-2"
    >
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        HDG
      </span>
      <span className="font-mono text-lg tabular-nums text-foreground">
        {formatHeading(heading)}
      </span>
    </HudPanel>
  );
}
