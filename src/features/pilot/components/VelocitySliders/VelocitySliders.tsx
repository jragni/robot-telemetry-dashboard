import { useStore } from 'zustand';

import type { VelocitySlidersProps } from './VelocitySliders.types';

const MIN = 0.1;
const MAX = 2.0;
const STEP = 0.1;

export function VelocitySliders({ controlStore }: VelocitySlidersProps) {
  const eStopActive = useStore(controlStore, (s) => s.eStopActive);
  const linearVelocity = useStore(controlStore, (s) => s.linearVelocity);
  const angularVelocity = useStore(controlStore, (s) => s.angularVelocity);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label
          htmlFor="linear-velocity-slider"
          className="w-16 shrink-0 text-xs text-slate-400"
        >
          Linear
        </label>
        <input
          id="linear-velocity-slider"
          type="range"
          aria-label="Linear velocity"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={linearVelocity}
          aria-disabled={eStopActive ? 'true' : 'false'}
          min={MIN}
          max={MAX}
          step={STEP}
          value={linearVelocity}
          disabled={eStopActive}
          onChange={(e) =>
            controlStore
              .getState()
              .setLinearVelocity(parseFloat(e.target.value))
          }
          className="flex-1 accent-blue-500 disabled:opacity-50"
        />
        <span className="w-10 text-right font-mono text-xs text-blue-300">
          {linearVelocity.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500">m/s</span>
      </div>

      <div className="flex items-center gap-2">
        <label
          htmlFor="angular-velocity-slider"
          className="w-16 shrink-0 text-xs text-slate-400"
        >
          Angular
        </label>
        <input
          id="angular-velocity-slider"
          type="range"
          aria-label="Angular velocity"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={angularVelocity}
          aria-disabled={eStopActive ? 'true' : 'false'}
          min={MIN}
          max={MAX}
          step={STEP}
          value={angularVelocity}
          disabled={eStopActive}
          onChange={(e) =>
            controlStore
              .getState()
              .setAngularVelocity(parseFloat(e.target.value))
          }
          className="flex-1 accent-blue-500 disabled:opacity-50"
        />
        <span className="w-10 text-right font-mono text-xs text-blue-300">
          {angularVelocity.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500">rad/s</span>
      </div>
    </div>
  );
}
