import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, RefreshCw, Square } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DpadButton } from '@/components/controls/DpadButton';
import { VelocitySlider } from '@/components/controls/VelocitySlider';
import { KEY_TO_DIRECTION, VELOCITY_LIMITS } from '@/constants/controls';
import type { Direction } from '@/types/control.types';

import { EStopButton } from './EStopButton';
import { HUD_PANEL_BASE } from '../../constants';
import type { PilotControlsProps } from '../../types/PilotPage.types';

/** PilotControls
 * @description Renders the compact HUD controls overlay with D-pad, velocity
 *  sliders, E-STOP, and an optional Reconnect button. Reuses shared DpadButton
 *  and VelocitySlider components with the useControlPublisher hook. Keyboard
 *  handling is scoped to the panel ref. Escape priority: fullscreen exit takes
 *  precedence over E-STOP when in fullscreen mode. The Reconnect button only
 *  renders while the robot is disconnected and an onReconnect handler is
 *  provided — placed above E-STOP so the recovery action sits next to the
 *  disabled controls.
 * @prop angularVelocity - Current angular velocity in rad/s.
 * @prop connected - Whether the robot is connected.
 * @prop isFullscreen - Whether Pilot Mode is in fullscreen (affects Escape handling).
 * @prop linearVelocity - Current linear velocity in m/s.
 * @prop onAngularVelocityChange - Callback when angular slider changes.
 * @prop onDirectionEnd - Callback when a direction press ends.
 * @prop onDirectionStart - Callback when a direction press begins.
 * @prop onEmergencyStop - Callback for emergency stop.
 * @prop onLinearVelocityChange - Callback when linear slider changes.
 * @prop onReconnect - Optional callback to reconnect when rosbridge is disconnected.
 */
export function PilotControls({
  angularVelocity,
  connected,
  isFullscreen,
  linearVelocity,
  onAngularVelocityChange,
  onDirectionEnd,
  onDirectionStart,
  onEmergencyStop,
  onLinearVelocityChange,
  onReconnect,
}: PilotControlsProps) {
  const disabled = !connected;
  const showReconnect = !connected && !!onReconnect;
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
      className={`${HUD_PANEL_BASE} @container p-2 lg:p-3 flex flex-col gap-2 lg:gap-3`}
      tabIndex={0}
      role="toolbar"
      aria-label="Robot controls — use arrow keys to move, Escape for emergency stop"
    >
      {showReconnect ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconnect}
          className="w-full font-mono text-xs gap-1.5 text-text-muted hover:text-text-primary cursor-pointer"
          aria-label="Reconnect to robot"
        >
          <RefreshCw className="size-3" />
          Reconnect
        </Button>
      ) : null}

      <EStopButton disabled={disabled} onEmergencyStop={onEmergencyStop} />

      <div
        className="grid grid-cols-3 gap-0.5 w-fit mx-auto"
        role="group"
        aria-label="Directional controls"
      >
        <div />
        <DpadButton
          direction="forward"
          icon={ChevronUp}
          label="Move forward"
          activeDirection={activeDirection}
          disabled={disabled}
          onStart={handleStart}
          onEnd={handleEnd}
        />
        <div />
        <DpadButton
          direction="left"
          icon={ChevronLeft}
          label="Turn left"
          activeDirection={activeDirection}
          disabled={disabled}
          onStart={handleStart}
          onEnd={handleEnd}
        />
        <DpadButton
          direction="stop"
          icon={Square}
          label="Stop"
          activeDirection={null}
          disabled={disabled}
          onStart={handleStart}
          onEnd={handleEnd}
        />
        <DpadButton
          direction="right"
          icon={ChevronRight}
          label="Turn right"
          activeDirection={activeDirection}
          disabled={disabled}
          onStart={handleStart}
          onEnd={handleEnd}
        />
        <div />
        <DpadButton
          direction="backward"
          icon={ChevronDown}
          label="Move backward"
          activeDirection={activeDirection}
          disabled={disabled}
          onStart={handleStart}
          onEnd={handleEnd}
        />
        <div />
      </div>

      <div className="flex flex-col gap-2">
        <VelocitySlider
          label="LIN"
          value={linearVelocity}
          min={VELOCITY_LIMITS.linear.min}
          max={VELOCITY_LIMITS.linear.max}
          step={0.01}
          unit="m/s"
          disabled={disabled}
          onChange={onLinearVelocityChange}
        />
        <VelocitySlider
          label="ANG"
          value={angularVelocity}
          min={VELOCITY_LIMITS.angular.min}
          max={VELOCITY_LIMITS.angular.max}
          step={0.01}
          unit="rad/s"
          disabled={disabled}
          onChange={onAngularVelocityChange}
        />
      </div>
    </div>
  );
}
