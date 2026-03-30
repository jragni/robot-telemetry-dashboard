import { RobotCardDataRow } from './RobotCardDataRow';

/**
 * Renders uptime and battery vitals when the robot is connected.
 */
export function RobotCardVitals() {
  return (
    <dl className="flex flex-col gap-2">
      <RobotCardDataRow label="Uptime" value="—" />
      <RobotCardDataRow
        label="Battery"
        value="—"
        valueClassName="text-status-nominal"
      />
    </dl>
  );
}
