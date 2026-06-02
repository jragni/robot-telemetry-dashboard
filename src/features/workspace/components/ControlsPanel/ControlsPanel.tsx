import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, OctagonX, Square } from 'lucide-react';

import { useControlPublisher } from '@/hooks';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DpadButton, VelocitySlider } from '@/components/controls';
import { KEY_TO_DIRECTION, VELOCITY_LIMITS } from '@/constants/controls';
import type { Direction } from '@/types/control.types';

import type { ControlsPanelProps } from './ControlsPanel.types';

/** ControlsPanel
 * @description Renders robot directional controls with E-STOP, D-pad for
 *  press-and-hold movement, velocity sliders, and live readouts. Owns its
 *  own ROS publisher via useControlPublisher. Supports keyboard navigation:
 *  arrow keys for direction, Escape for E-STOP.
 * @prop ros - roslib Ros instance for publishing commands (undefined when disconnected).
 * @prop connected - Whether the robot connection is active.
 * @prop topicName - ROS topic name for Twist command publishing.
 */
export function ControlsPanel({ connected, ros, topicName }: ControlsPanelProps) {
  const {
    angularVelocity,
    handleAngularChange,
    handleDirectionEnd,
    handleDirectionStart,
    handleEmergencyStop,
    handleLinearChange,
    isActive,
    linearVelocity,
  } = useControlPublisher({ ros, topicName });
  const disabled = !connected;
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null);
  const activeRef = useRef<Direction | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback(
    (direction: Direction) => {
      if (direction === 'stop') {
        activeRef.current = null;
        setActiveDirection(null);
        handleDirectionEnd();
        return;
      }
      activeRef.current = direction;
      setActiveDirection(direction);
      handleDirectionStart(direction);
    },
    [handleDirectionStart, handleDirectionEnd],
  );

  const handleEnd = useCallback(() => {
    activeRef.current = null;
    setActiveDirection(null);
    handleDirectionEnd();
  }, [handleDirectionEnd]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleEmergencyStop();
        return;
      }
      const direction = KEY_TO_DIRECTION[e.key];
      if (direction && !e.repeat) {
        e.preventDefault();
        activeRef.current = direction;
        setActiveDirection(direction);
        handleDirectionStart(direction);
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      const direction = KEY_TO_DIRECTION[e.key];
      if (direction && activeRef.current === direction) {
        e.preventDefault();
        activeRef.current = null;
        setActiveDirection(null);
        handleDirectionEnd();
      }
    }

    panel.addEventListener('keydown', handleKeyDown);
    panel.addEventListener('keyup', handleKeyUp);

    return () => {
      panel.removeEventListener('keydown', handleKeyDown);
      panel.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleDirectionStart, handleDirectionEnd, handleEmergencyStop]);

  return (
    <div
      ref={panelRef}
      className="flex flex-col h-full w-full [container-type:size] items-center justify-between gap-[clamp(0.25rem,1.5cqh,0.625rem)] px-1 text-[clamp(0.7rem,3.4cqmin,1rem)]"
      tabIndex={0}
      role="toolbar"
      aria-label="Robot controls — use arrow keys to move, Escape for emergency stop"
    >
      <Button
        variant="danger"
        size="sm"
        disabled={disabled}
        aria-label="Emergency stop"
        className="w-full shrink-0 h-auto py-[clamp(0.25rem,1.5cqh,0.5rem)] font-mono text-[1em] font-semibold cursor-pointer transition-all duration-200"
        onClick={handleEmergencyStop}
      >
        <OctagonX className="size-[1.1em]" />
        E-STOP
      </Button>

      <div
        className="flex-1 min-h-0 w-full flex items-center justify-center [container-type:size]"
        style={{ '--dpad-size': 'clamp(1.5rem, 28cqmin, 5rem)' } as React.CSSProperties}
      >
        <div
          className="grid grid-cols-3 gap-[6%] w-fit"
          role="group"
          aria-label="Directional controls — press and hold"
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
      </div>

      <div className="w-full shrink-0 flex flex-col gap-[clamp(0.25rem,1cqh,0.5rem)]">
        <VelocitySlider
          label="LINEAR"
          value={linearVelocity}
          min={VELOCITY_LIMITS.linear.min}
          max={VELOCITY_LIMITS.linear.max}
          step={0.01}
          unit="m/s"
          disabled={disabled}
          onChange={handleLinearChange}
        />
        <VelocitySlider
          label="ANGULAR"
          value={angularVelocity}
          min={VELOCITY_LIMITS.angular.min}
          max={VELOCITY_LIMITS.angular.max}
          step={0.01}
          unit="rad/s"
          disabled={disabled}
          onChange={handleAngularChange}
        />
      </div>

      <div className="shrink-0 flex items-center gap-1.5 font-mono text-[0.8em]">
        <span
          className={cn(
            'size-2 rounded-full',
            !connected && 'bg-status-critical',
            connected && !isActive && 'bg-status-offline',
            connected && isActive && 'bg-status-nominal motion-safe:animate-pulse',
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            !connected && 'text-status-offline',
            connected && !isActive && 'text-status-offline',
            connected && isActive && 'text-status-nominal',
          )}
        >
          {!connected ? 'DISCONNECTED' : isActive ? 'ACTIVE' : 'STOPPED'}
        </span>
      </div>
    </div>
  );
}
