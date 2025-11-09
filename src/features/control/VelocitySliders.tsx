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
    <div className="flex gap-6 h-[120px]">
      {/* Linear Velocity */}
      <div className="flex flex-col items-center gap-1.5 min-w-[44px]">
        <div className="text-center">
          <div className="text-[9px] font-mono font-semibold text-muted-foreground tracking-wider">
            LINEAR
          </div>
          <div className="text-[8px] font-mono text-muted-foreground/70">
            m/s
          </div>
        </div>
        <div className="relative flex-1 flex items-center justify-center w-full">
          <Slider
            orientation="vertical"
            min={VELOCITY_LIMITS.linear.min}
            max={VELOCITY_LIMITS.linear.max}
            step={0.01}
            value={[linearVelocity]}
            onValueChange={([value]) => onLinearChange(value)}
            className="touch-none h-full min-w-[44px] flex-col"
            aria-label={`Linear velocity: ${linearVelocity.toFixed(2)} meters per second`}
            aria-valuemin={VELOCITY_LIMITS.linear.min}
            aria-valuemax={VELOCITY_LIMITS.linear.max}
            aria-valuenow={linearVelocity}
            aria-valuetext={`${linearVelocity.toFixed(2)} meters per second`}
          />
          {/* Min/Max indicators */}
          <div className="absolute -right-6 top-0 text-[8px] font-mono text-muted-foreground/50">
            {VELOCITY_LIMITS.linear.max.toFixed(1)}
          </div>
          <div className="absolute -right-6 bottom-0 text-[8px] font-mono text-muted-foreground/50">
            {VELOCITY_LIMITS.linear.min.toFixed(1)}
          </div>
        </div>
        <div className="text-[10px] font-mono font-semibold text-foreground bg-secondary px-1.5 py-0.5 rounded-xs min-w-[38px] text-center">
          {linearVelocity.toFixed(2)}
        </div>
      </div>

      {/* Angular Velocity */}
      <div className="flex flex-col items-center gap-1.5 min-w-[44px]">
        <div className="text-center">
          <div className="text-[9px] font-mono font-semibold text-muted-foreground tracking-wider">
            ANGULAR
          </div>
          <div className="text-[8px] font-mono text-muted-foreground/70">
            rad/s
          </div>
        </div>
        <div className="relative flex-1 flex items-center justify-center w-full">
          <Slider
            orientation="vertical"
            min={VELOCITY_LIMITS.angular.min}
            max={VELOCITY_LIMITS.angular.max}
            step={0.1}
            value={[angularVelocity]}
            onValueChange={([value]) => onAngularChange(value)}
            className="touch-none h-full min-w-[44px] flex-col"
            aria-label={`Angular velocity: ${angularVelocity.toFixed(2)} radians per second`}
            aria-valuemin={VELOCITY_LIMITS.angular.min}
            aria-valuemax={VELOCITY_LIMITS.angular.max}
            aria-valuenow={angularVelocity}
            aria-valuetext={`${angularVelocity.toFixed(2)} radians per second`}
          />
          {/* Min/Max indicators */}
          <div className="absolute -right-6 top-0 text-[8px] font-mono text-muted-foreground/50">
            {VELOCITY_LIMITS.angular.max.toFixed(1)}
          </div>
          <div className="absolute -right-6 bottom-0 text-[8px] font-mono text-muted-foreground/50">
            {VELOCITY_LIMITS.angular.min.toFixed(1)}
          </div>
        </div>
        <div className="text-[10px] font-mono font-semibold text-foreground bg-secondary px-1.5 py-0.5 rounded-xs min-w-[38px] text-center">
          {angularVelocity.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

export default VelocitySliders;
