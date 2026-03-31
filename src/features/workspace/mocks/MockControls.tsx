import { OctagonX } from 'lucide-react';
import { DPAD_BTN } from '../constants';

/** MockControls
 * @description Renders mock robot controls with E-STOP button, directional
 *  D-pad, and velocity readouts.
 */
export function MockControls() {
  return (
    <div className="flex flex-col items-center gap-4">
      <button
        aria-label="Emergency stop"
        className="w-20 h-10 bg-status-critical rounded-sm font-mono text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        <OctagonX className="size-4" />
        E-STOP
      </button>
      <div
        className="grid grid-cols-3 gap-1"
        role="group"
        aria-label="Directional controls"
      >
        <div />
        <button
          aria-label="Move forward"
          className={`${DPAD_BTN} text-text-muted`}
        >
          ▲
        </button>
        <div />
        <button
          aria-label="Turn left"
          className={`${DPAD_BTN} text-text-muted`}
        >
          ◀
        </button>
        <button
          aria-label="Stop"
          className={`${DPAD_BTN} text-status-critical`}
        >
          ■
        </button>
        <button
          aria-label="Turn right"
          className={`${DPAD_BTN} text-text-muted`}
        >
          ▶
        </button>
        <div />
        <button
          aria-label="Move backward"
          className={`${DPAD_BTN} text-text-muted`}
        >
          ▼
        </button>
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
