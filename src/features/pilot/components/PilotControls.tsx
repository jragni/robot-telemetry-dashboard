import { useCallback, useEffect, useRef, useState } from 'react';
import { OctagonX, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DpadButton } from '@/components/controls/DpadButton';
import { VelocitySlider } from '@/components/controls/VelocitySlider';
import { KEY_TO_DIRECTION, VELOCITY_LIMITS } from '@/constants/controls.constants';
import type { Direction } from '@/types/control.types';
import { HUD_PANEL_BASE } from '../constants';
import type { PilotControlsProps } from '../types/PilotView.types';

/** PilotControls
 * @description Renders the compact HUD controls overlay with D-pad, velocity
 *  sliders, and E-STOP button. Reuses shared DpadButton and VelocitySlider
 *  components with the useControlPublisher hook. Keyboard handling is scoped
 *  to the panel ref. Escape priority: fullscreen exit takes precedence over
 *  E-STOP when in fullscreen mode.
 * @param connected - Whether the robot is connected.
 * @param activeDirection - Currently active D-pad direction.
 * @param linearVelocity - Current linear velocity in m/s.
 * @param angularVelocity - Current angular velocity in rad/s.
 * @param isActive - Whether controls are actively sending commands.
 * @param isFullscreen - Whether Pilot Mode is in fullscreen (affects Escape handling).
 * @param onDirectionStart - Callback when a direction press begins.
 * @param onDirectionEnd - Callback when a direction press ends.
 * @param onLinearVelocityChange - Callback when linear slider changes.
 * @param onAngularVelocityChange - Callback when angular slider changes.
 * @param onEmergencyStop - Callback for emergency stop.
 */
export function PilotControls({
  connected,
  linearVelocity,
  angularVelocity,
  isFullscreen,
  onDirectionStart,
  onDirectionEnd,
  onLinearVelocityChange,
  onAngularVelocityChange,
  onEmergencyStop,
}: PilotControlsProps) {
  const disabled = !connected;
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null);
  const activeRef = useRef<Direction | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback(
    (direction: Direction) => {
      if (direction === 'stop') {
        activeRef.current = null;
        setActiveDirection(null);
        onDirectionEnd();
        return;
      }
      activeRef.current = direction;
      setActiveDirection(direction);
      onDirectionStart(direction);
    },
    [onDirectionStart, onDirectionEnd],
  );

  const handleEnd = useCallback(() => {
    activeRef.current = null;
    setActiveDirection(null);
    onDirectionEnd();
  }, [onDirectionEnd]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isFullscreen) {
        e.preventDefault();
        onEmergencyStop();
        return;
      }
      const direction = KEY_TO_DIRECTION[e.key];
      if (direction && !e.repeat) {
        e.preventDefault();
        activeRef.current = direction;
        setActiveDirection(direction);
        onDirectionStart(direction);
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[e.key];
      if (direction && activeRef.current === direction) {
        e.preventDefault();
        activeRef.current = null;
        setActiveDirection(null);
        onDirectionEnd();
      }
    }

    panel.addEventListener('keydown', handleKeyDown);
    panel.addEventListener('keyup', handleKeyUp);

    return () => {
      panel.removeEventListener('keydown', handleKeyDown);
      panel.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFullscreen, onDirectionStart, onDirectionEnd, onEmergencyStop]);

  return (
    <div
      ref={panelRef}
      className={`${HUD_PANEL_BASE} p-3 flex flex-col gap-3`}
      tabIndex={0}
      role="toolbar"
      aria-label="Robot controls — use arrow keys to move, Escape for emergency stop"
    >
      <EStopButton disabled={disabled} onEmergencyStop={onEmergencyStop} />

      <div
        className="grid grid-cols-3 gap-0.5"
        role="group"
        aria-label="Directional controls"
      >
        <div />
        <DpadButton direction="forward" icon={ChevronUp} label="Move forward" activeDirection={activeDirection} disabled={disabled} onStart={handleStart} onEnd={handleEnd} />
        <div />
        <DpadButton direction="left" icon={ChevronLeft} label="Turn left" activeDirection={activeDirection} disabled={disabled} onStart={handleStart} onEnd={handleEnd} />
        <DpadButton direction="stop" icon={Square} label="Stop" activeDirection={null} disabled={disabled} onStart={handleStart} onEnd={handleEnd} />
        <DpadButton direction="right" icon={ChevronRight} label="Turn right" activeDirection={activeDirection} disabled={disabled} onStart={handleStart} onEnd={handleEnd} />
        <div />
        <DpadButton direction="backward" icon={ChevronDown} label="Move backward" activeDirection={activeDirection} disabled={disabled} onStart={handleStart} onEnd={handleEnd} />
        <div />
      </div>

      <div className="flex flex-col gap-2">
        <VelocitySlider label="LIN" value={linearVelocity} min={VELOCITY_LIMITS.linear.min} max={VELOCITY_LIMITS.linear.max} step={0.01} unit="m/s" disabled={disabled} onChange={onLinearVelocityChange} />
        <VelocitySlider label="ANG" value={angularVelocity} min={VELOCITY_LIMITS.angular.min} max={VELOCITY_LIMITS.angular.max} step={0.01} unit="rad/s" disabled={disabled} onChange={onAngularVelocityChange} />
      </div>
    </div>
  );
}

/** EStopButtonProps
 * @description Props for the E-STOP button subcomponent.
 */
interface EStopButtonProps {
  readonly disabled: boolean;
  readonly onEmergencyStop: () => void;
}

/** EStopButton
 * @description Renders the emergency stop button with pulsing border glow,
 *  OctagonX icon, and letter-spaced stencil text.
 */
function EStopButton({ disabled, onEmergencyStop }: EStopButtonProps) {
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
