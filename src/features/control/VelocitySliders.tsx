import { VELOCITY_LIMITS } from './constants';
import type { VelocitySlidersProps } from './definitions';

import { Slider } from '@/components/ui/slider';

function VelocitySliders({
  linearVelocity,
  angularVelocity,
  onLinearChange,
  onAngularChange,
}: VelocitySlidersProps) {
  return (
    <div className="flex gap-4 h-[120px]">
      {/* Linear Velocity */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[9px] font-mono text-muted-foreground writing-mode-vertical">
          LIN
        </span>
        <Slider
          orientation="vertical"
          min={VELOCITY_LIMITS.linear.min}
          max={VELOCITY_LIMITS.linear.max}
          step={0.01}
          value={[linearVelocity]}
          onValueChange={([value]) => onLinearChange(value)}
          className="touch-none h-full w-2 flex-col"
          aria-label="Linear velocity"
        />
        <span className="text-[10px] font-mono text-foreground">
          {linearVelocity.toFixed(2)}
        </span>
      </div>

      {/* Angular Velocity */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground writing-mode-vertical">
          ANG
        </span>
        <Slider
          orientation="vertical"
          min={VELOCITY_LIMITS.angular.min}
          max={VELOCITY_LIMITS.angular.max}
          step={0.1}
          value={[angularVelocity]}
          onValueChange={([value]) => onAngularChange(value)}
          className="touch-none h-full w-2 flex-col"
          aria-label="Angular velocity"
        />
        <span className="text-[10px] font-mono text-foreground">
          {angularVelocity.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export default VelocitySliders;
