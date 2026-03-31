import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IMU_VIZ_OPTIONS } from '@/features/workspace/constants';
import type { ImuVariant, ImuVizSelectProps } from '@/features/workspace/types/ImuPanel.types';

/** ImuVizSelect
 * @description Renders an IMU variant selector dropdown with abbreviated
 *  trigger labels for compact panel footer display.
 * @param value - Currently selected variant.
 * @param onChange - Callback when selection changes.
 */
export function ImuVizSelect({ value, onChange }: ImuVizSelectProps) {
  const current = IMU_VIZ_OPTIONS.find((opt) => opt.value === value);

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (IMU_VIZ_OPTIONS.some((opt) => opt.value === v)) {
          onChange(v as ImuVariant);
        }
      }}
    >
      <SelectTrigger
        className="h-6 w-36 font-mono text-xs bg-surface-tertiary border-border px-2"
        aria-label="IMU visualization mode"
      >
        <span className="font-sans text-text-muted mr-1">MODE:</span>
        <SelectValue>{current?.shortLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-surface-secondary border-border">
        {IMU_VIZ_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="font-mono text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
