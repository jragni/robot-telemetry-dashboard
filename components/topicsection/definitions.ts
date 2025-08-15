/** Topic Section definitions */

import { RobotConnection } from '../dashboard/definitions';

// Interfaces

export interface TopicTableRowProps {
  hideRawMessage: boolean
  messageType: string;
  selectedConnection?: RobotConnection | null;
  topicName: string;
}