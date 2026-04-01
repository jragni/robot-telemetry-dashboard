import { OctagonX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EStopButtonProps } from '../../types/PilotControls.types';

/** EStopButton
 * @description Renders the emergency stop button with pulsing border glow,
 *  OctagonX icon, and letter-spaced stencil text.
 * @param disabled - Whether the button is disabled (robot disconnected).
 * @param onEmergencyStop - Callback for emergency stop.
 */
export function EStopButton({ disabled, onEmergencyStop }: EStopButtonProps) {
  return (
    <Button
      variant="danger"
      size="sm"
      disabled={disabled}
      aria-label="Emergency stop"
      className="w-full font-mono text-xs font-semibold tracking-widest cursor-pointer transition-all duration-200"
      onClick={onEmergencyStop}
    >
      <OctagonX className="size-4" />
      E-STOP
    </Button>
  );
}
