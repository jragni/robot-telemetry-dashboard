import { formatLastSeen } from '@/utils/formatLastSeen';
import type { RobotCardConnectionProps } from '../../types/RobotCardConnection.types';
import { RobotCardDataRow } from './RobotCardDataRow';

/**
 * Renders connection info rows: rosbridge URL and last seen timestamp.
 * @param url - Rosbridge WebSocket URL.
 * @param lastSeen - Timestamp of last rosbridge message, or null.
 */
export function RobotCardConnection({
  url,
  lastSeen,
}: RobotCardConnectionProps) {
  return (
    <dl className="flex flex-col gap-2">
      <RobotCardDataRow
        label="URL"
        value={url}
        valueClassName="text-text-secondary truncate max-w-45"
      />
      <RobotCardDataRow
        label="Last seen"
        value={formatLastSeen(lastSeen)}
        valueClassName="text-accent"
      />
    </dl>
  );
}
