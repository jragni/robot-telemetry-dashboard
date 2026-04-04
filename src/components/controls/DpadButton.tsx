import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DPAD_BTN, DPAD_BTN_ACTIVE } from '@/constants/controls';
import type { DpadButtonProps } from '@/types/DpadButton.types';

/** DpadButton
 * @description Renders a single D-pad directional button with press-and-hold
 *  behavior. Fires onStart on pointerdown and onEnd on pointerup/pointerleave.
 *  Only fires onEnd if this button is currently pressed, preventing spurious
 *  zero-velocity publishes on casual hover.
 * @param direction - The direction this button represents.
 * @param icon - The Lucide icon component to render.
 * @param label - Accessible aria-label for the button.
 * @param activeDirection - Currently active direction for highlight state.
 * @param disabled - Whether the button is disabled (robot disconnected).
 * @param onStart - Callback when press begins.
 * @param onEnd - Callback when press ends.
 */
export function DpadButton({
  activeDirection,
  direction,
  disabled,
  icon: Icon,
  label,
  onEnd,
  onStart,
}: DpadButtonProps) {
  const pressedRef = useRef(false);
  const isActive = activeDirection === direction;
  const isStop = direction === 'stop';

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={disabled}
      aria-label={label}
      className={cn(DPAD_BTN, isActive && DPAD_BTN_ACTIVE, isStop && 'text-status-critical')}
      onPointerDown={(e) => {
        e.preventDefault();
        pressedRef.current = true;
        onStart(direction);
      }}
      onPointerUp={() => {
        if (pressedRef.current) {
          pressedRef.current = false;
          onEnd();
        }
      }}
      onPointerLeave={() => {
        if (pressedRef.current) {
          pressedRef.current = false;
          onEnd();
        }
      }}
    >
      <Icon className="size-3.5 @xs:size-4" />
    </Button>
  );
}
