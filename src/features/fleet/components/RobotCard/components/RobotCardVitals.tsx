import { getBatteryColor } from '@/utils/getBatteryColor';
import { RobotCardDataRow } from './RobotCardDataRow';
import type { RobotCardVitalsProps } from '../types/RobotCardVitals.types';

/** RobotCardVitals
 * @description Renders battery vitals when the robot is connected.
 * @prop battery - Battery status or null if not discovered.
 */
export function RobotCardVitals({ battery }: RobotCardVitalsProps) {
  const batteryValue = battery ? `${String(Math.round(battery.percentage))}%` : '—';
  const batteryColor = getBatteryColor(battery?.percentage ?? null);

  return (
    <dl className="flex flex-col gap-2">
      <RobotCardDataRow label="Battery" value={batteryValue} valueClassName={batteryColor} />
    </dl>
  );
}
