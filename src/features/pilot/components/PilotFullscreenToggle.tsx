import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** PilotFullscreenToggleProps
 * @description Props for the fullscreen toggle button.
 */
interface PilotFullscreenToggleProps {
  readonly isFullscreen: boolean;
  readonly onToggle: () => void;
}

/** PilotFullscreenToggle
 * @description Renders a ghost button that toggles Pilot Mode between normal
 *  and fullscreen view. Shows Maximize2 icon when normal, Minimize2 when
 *  fullscreen. Includes keyboard shortcut hint.
 * @param isFullscreen - Whether Pilot Mode is currently fullscreen.
 * @param onToggle - Callback to toggle fullscreen state.
 */
export function PilotFullscreenToggle({ isFullscreen, onToggle }: PilotFullscreenToggleProps) {
  const Icon = isFullscreen ? Minimize2 : Maximize2;
  const label = isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)';

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      onClick={onToggle}
      className="text-text-muted hover:text-text-primary cursor-pointer transition-colors duration-150"
    >
      <Icon className="size-4" />
    </Button>
  );
}
