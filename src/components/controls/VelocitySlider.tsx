import { Slider } from '@/components/ui/slider';
import type { VelocitySliderProps } from '@/types/VelocitySlider.types';

/** VelocitySlider
 * @description Renders a labeled velocity slider with current value readout.
 * @prop label - Display label (e.g., "LINEAR").
 * @prop value - Current velocity value.
 * @prop min - Minimum slider value.
 * @prop max - Maximum slider value.
 * @prop step - Slider step increment.
 * @prop unit - Unit suffix for the readout.
 * @prop disabled - Whether the slider is disabled.
 * @prop onChange - Callback when slider value changes.
 */
export function VelocitySlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  disabled,
  onChange,
}: VelocitySliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs text-text-muted">{label}</span>
        <span className="font-mono text-xs text-accent tabular-nums">
          {value.toFixed(2)} {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(values) => {
          if (values[0] !== undefined) onChange(values[0]);
        }}
        className="cursor-pointer"
      />
    </div>
  );
}
