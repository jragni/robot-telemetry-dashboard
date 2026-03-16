import { MAX_VEL, MIN_VEL, STEP_VEL } from './VelocitySliders.constants';
import type { VelocitySlidersProps } from './VelocitySliders.types';

import { Slider } from '@/components/ui/slider';
import { useControlStore } from '@/stores/control/control.store';

/**
 * Sliders for tuning the linear and angular velocity limits that
 * useControlPublisher uses when constructing Twist messages.
 */
export function VelocitySliders({ robotId }: VelocitySlidersProps) {
  const { linearVelocity, angularVelocity } = robotId
    ? useControlStore.getState().getControlState(robotId)
    : { linearVelocity: 0.5, angularVelocity: 0.5 };

  function handleLinearChange(values: number[]) {
    if (!robotId) return;
    useControlStore
      .getState()
      .setLinearVelocity(robotId, values[0] ?? linearVelocity);
  }

  function handleAngularChange(values: number[]) {
    if (!robotId) return;
    useControlStore
      .getState()
      .setAngularVelocity(robotId, values[0] ?? angularVelocity);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Linear velocity */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="linear-vel-slider"
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Linear
          </label>
          <span className="font-mono text-xs text-foreground tabular-nums w-10 text-right">
            {linearVelocity.toFixed(1)}
          </span>
        </div>
        <Slider
          id="linear-vel-slider"
          aria-label="Linear velocity"
          min={MIN_VEL}
          max={MAX_VEL}
          step={STEP_VEL}
          value={[linearVelocity]}
          onValueChange={handleLinearChange}
        />
      </div>

      {/* Angular velocity */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="angular-vel-slider"
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Angular
          </label>
          <span className="font-mono text-xs text-foreground tabular-nums w-10 text-right">
            {angularVelocity.toFixed(1)}
          </span>
        </div>
        <Slider
          id="angular-vel-slider"
          aria-label="Angular velocity"
          min={MIN_VEL}
          max={MAX_VEL}
          step={STEP_VEL}
          value={[angularVelocity]}
          onValueChange={handleAngularChange}
        />
      </div>
    </div>
  );
}
