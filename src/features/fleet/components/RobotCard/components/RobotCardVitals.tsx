import type { BatteryStatus } from '@/features/workspace/types/SystemStatusPanel.types';
import { RobotCardDataRow } from './RobotCardDataRow';

/** RobotCardVitalsProps */
interface RobotCardVitalsProps {
  readonly battery: BatteryStatus | null;
}

/** RobotCardVitals
 * @description Renders battery vitals when the robot is connected.
 * @param battery - Battery status or null if not discovered.
 */
export function RobotCardVitals({ battery }: RobotCardVitalsProps) {
  const batteryValue = battery ? `${String(Math.round(battery.percentage))}%` : '—';
  const batteryColor = battery && battery.percentage > 50
    ? 'text-status-nominal'
    : battery && battery.percentage > 20
      ? 'text-status-caution'
      : battery
        ? 'text-status-critical'
        : undefined;

  return (
    <dl className="flex flex-col gap-2">
      <RobotCardDataRow
        label="Battery"
        value={batteryValue}
        valueClassName={batteryColor}
      />
    </dl>
  );
}
