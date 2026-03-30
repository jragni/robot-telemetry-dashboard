import type { RobotCardDataRowProps } from '../../types/RobotCardDataRow.types';

/** RobotCardDataRow
 * @description Renders a single key-value row in a definition list.
 * @param label - The data label displayed on the left.
 * @param value - The data value displayed on the right.
 * @param valueClassName - Optional override for value text color.
 */
export function RobotCardDataRow({
  label,
  value,
  valueClassName = 'text-text-primary',
}: RobotCardDataRowProps) {
  return (
    <div className="flex justify-between items-baseline">
      <dt className="font-sans text-xs text-text-muted">{label}</dt>
      <dd className={`font-mono text-xs tabular-nums ${valueClassName}`}>
        {value}
      </dd>
    </div>
  );
}
