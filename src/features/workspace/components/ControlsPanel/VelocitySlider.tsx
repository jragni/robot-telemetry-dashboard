import { Slider } from '@/components/ui/slider';
import type { VelocitySliderProps } from '@/features/workspace/types/ControlsPanel.types';

/** VelocitySlider
 * @description Renders a labeled velocity slider with current value readout.
 * @param label - Display label (e.g., "LINEAR").
 * @param value - Current velocity value.
 * @param min - Minimum slider value.
 * @param max - Maximum slider value.
 * @param step - Slider step increment.
 * @param unit - Unit suffix for the readout.
 * @param disabled - Whether the slider is disabled.
 * @param onChange - Callback when slider value changes.
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
