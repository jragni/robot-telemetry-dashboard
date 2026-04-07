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
 * @prop direction - The direction this button represents.
 * @prop icon - The Lucide icon component to render.
 * @prop label - Accessible aria-label for the button.
 * @prop activeDirection - Currently active direction for highlight state.
 * @prop disabled - Whether the button is disabled (robot disconnected).
 * @prop onStart - Callback when press begins.
 * @prop onEnd - Callback when press ends.
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
