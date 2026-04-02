import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PilotFullscreenToggleProps } from '../types/PilotFullscreenToggle.types';

/** PilotFullscreenToggle
 * @description Renders a button that toggles Pilot Mode between normal
 *  and fullscreen view. Styled with semi-transparent backdrop to match
 *  the Dashboard button and other HUD controls.
 * @param isFullscreen - Whether Pilot Mode is currently fullscreen.
 * @param onToggle - Callback to toggle fullscreen state.
 */
export function PilotFullscreenToggle({ isFullscreen, onToggle }: PilotFullscreenToggleProps) {
  const Icon = isFullscreen ? Minimize2 : Maximize2;
  const label = isFullscreen ? 'Exit fullscreen' : 'Fullscreen';

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={`${label} (F)`}
      onClick={onToggle}
      className="bg-surface-base/60 backdrop-blur-sm text-text-primary hover:bg-surface-base/80 font-mono text-xs gap-1.5 cursor-pointer"
    >
      <Icon size={14} />
      {label}
    </Button>
  );
}
