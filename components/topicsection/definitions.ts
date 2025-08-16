/** Topic Section definitions */

import { RobotConnection } from '../dashboard/definitions';

// Interfaces

export interface TopicTableRowProps {
  messageType: string;
  selectedConnection?: RobotConnection | null;
  topicName: string;
}