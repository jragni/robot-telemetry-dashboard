import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  OctagonX,
} from 'lucide-react';
import type { MouseEvent, TouchEvent } from 'react';

import type { Direction } from '../control.types';
import { useControlPublisher } from '../hooks/useControlPublisher';

import { Button } from '@/components/ui/button';
import { useControlStore } from '@/stores/control.store';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ControlPadProps {
  robotId: string | undefined;
}

// ---------------------------------------------------------------------------
// Direction button config
// ---------------------------------------------------------------------------

interface DirButtonConfig {
  direction: Direction;
  label: string;
  icon: React.ReactNode;
  gridArea: string;
}

const DIRECTION_BUTTONS: DirButtonConfig[] = [
  {
    direction: 'forward',
    label: 'Forward',
    icon: <ArrowUp className="size-5" aria-hidden="true" />,
    gridArea: 'forward',
  },
  {
    direction: 'left',
    label: 'Left',
    icon: <ArrowLeft className="size-5" aria-hidden="true" />,
    gridArea: 'left',
  },
  {
    direction: 'right',
    label: 'Right',
    icon: <ArrowRight className="size-5" aria-hidden="true" />,
    gridArea: 'right',
  },
  {
    direction: 'backward',
    label: 'Backward',
    icon: <ArrowDown className="size-5" aria-hidden="true" />,
    gridArea: 'backward',
  },
];

// ---------------------------------------------------------------------------
// ControlPad
// ---------------------------------------------------------------------------

/**
 * D-pad directional control pad with an E-Stop button.
 *
 * Layout (CSS grid areas):
 *
 *   .        [Forward]  .
 *   [Left]   [E-Stop]   [Right]
 *   .        [Backward] .
 *
 * Sends a direction command on mouseDown/touchStart and stop on mouseUp/touchEnd.
 * The E-Stop button immediately halts the robot and flags the store.
 */
export function ControlPad({ robotId }: ControlPadProps) {
  const { publish, isReady } = useControlPublisher(robotId);

  // ---- event handlers ----

  function handleDirectionDown(direction: Direction) {
    return (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      publish(direction);
    };
  }

  function handleDirectionUp(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    publish('stop');
  }

  function handleEStopDown(e: MouseEvent | TouchEvent) {
    e.preventDefault();
    if (robotId) useControlStore.getState().activateEStop(robotId);
    publish('stop');
  }

  return (
    <div
      role="group"
      aria-label="Robot directional controls"
      className="grid gap-2 select-none"
      style={{
        gridTemplateAreas:
          '".     forward  ."' +
          '"left   estop   right"' +
          '".     backward ."',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr',
      }}
    >
      {/* Directional buttons */}
      {DIRECTION_BUTTONS.map(({ direction, label, icon, gridArea }) => (
        <Button
          key={direction}
          aria-label={label}
          disabled={!isReady}
          variant="outline"
          size="icon-lg"
          style={{ gridArea }}
          className="h-14 w-full cursor-pointer touch-none bg-muted/40 border-border/60 hover:bg-primary/20 hover:border-primary/60 active:bg-primary/30 data-[pressed=true]:bg-primary/30 transition-colors"
          onMouseDown={handleDirectionDown(direction)}
          onMouseUp={handleDirectionUp}
          onMouseLeave={handleDirectionUp}
          onTouchStart={handleDirectionDown(direction)}
          onTouchEnd={handleDirectionUp}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      ))}

      {/* E-Stop — center cell */}
      <Button
        aria-label="E-Stop"
        disabled={!isReady}
        variant="destructive"
        size="icon-lg"
        style={{ gridArea: 'estop' }}
        className="h-14 w-full cursor-pointer touch-none font-bold tracking-widest text-xs transition-colors"
        onMouseDown={handleEStopDown}
        onTouchStart={handleEStopDown}
      >
        <OctagonX className="size-5" aria-hidden="true" />
        <span className="sr-only">E-Stop</span>
      </Button>
    </div>
  );
}
