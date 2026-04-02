import type { PanelId } from '@/features/workspace/types/panel.types';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export type RobotColor =
  | 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'purple'
  | 'teal' | 'orange' | 'pink' | 'lime' | 'indigo' | 'rose';

export interface RobotConnection {
  readonly color: RobotColor;
  readonly id: string;
  readonly lastError: string | null;
  readonly lastSeen: number | null;
  readonly name: string;
  readonly selectedTopics: Partial<Record<PanelId, string>>;
  readonly status: ConnectionStatus;
  readonly url: string;
}

export interface ConnectionState {
  readonly robots: Record<string, RobotConnection>;
}

export interface ConnectionActions {
  readonly addRobot: (name: string, url: string) => void;
  readonly connectRobot: (id: string) => Promise<void>;
  readonly disconnectRobot: (id: string) => void;
  readonly removeRobot: (id: string) => void;
  readonly setRobotTopic: (id: string, panelId: PanelId, topicName: string) => void;
  readonly updateRobot: (id: string, patch: Partial<RobotConnection>) => void;
}

export type ConnectionStore = ConnectionState & ConnectionActions;
