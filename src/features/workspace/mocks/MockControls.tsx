import { OctagonX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DPAD_BTN } from '../constants';

/** MockControls
 * @description Renders mock robot controls with E-STOP button, directional
 *  D-pad, and velocity readouts.
 */
export function MockControls() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        variant="danger"
        size="sm"
        aria-label="Emergency stop"
        className="w-20 font-mono text-xs font-semibold"
      >
        <OctagonX className="size-4" />
        E-STOP
      </Button>
      <div
        className="grid grid-cols-3 gap-1"
        role="group"
        aria-label="Directional controls"
      >
        <div />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Move forward"
          className={DPAD_BTN}
        >
          ▲
        </Button>
        <div />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Turn left"
          className={DPAD_BTN}
        >
          ◀
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Stop"
          className={`${DPAD_BTN} text-status-critical`}
        >
          ■
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Turn right"
          className={DPAD_BTN}
        >
          ▶
        </Button>
        <div />
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Move backward"
          className={DPAD_BTN}
        >
          ▼
        </Button>
        <div />
      </div>
      <div className="flex gap-4 font-mono text-xs">
        <div className="flex flex-col items-center gap-1">
          <span className="font-sans text-text-muted">LINEAR</span>
          <span className="text-accent tabular-nums">0.0 m/s</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-sans text-text-muted">ANGULAR</span>
          <span className="text-accent tabular-nums">0.0 rad/s</span>
        </div>
      </div>
    </div>
  );
}
