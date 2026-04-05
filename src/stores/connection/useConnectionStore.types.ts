import type { PanelId } from '@/types/panel.types';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export type RobotColor =
  | 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'purple'
  | 'teal' | 'orange' | 'pink' | 'lime' | 'indigo' | 'rose';

export interface RobotConnection {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly status: ConnectionStatus;
  readonly lastSeen: number | null;
  readonly lastError: string | null;
  readonly reconnectAttempt: number | null;
  readonly color: RobotColor;
  readonly selectedTopics: Partial<Record<PanelId, string>>;
}

export interface ConnectionState {
  readonly robots: Record<string, RobotConnection>;
}

export interface ConnectionActions {
  readonly addRobot: (name: string, url: string) => string | null;
  readonly removeRobot: (id: string) => void;
  readonly updateRobot: (id: string, patch: Partial<RobotConnection>) => void;
  readonly connectRobot: (id: string) => Promise<void>;
  readonly disconnectRobot: (id: string) => void;
  readonly setRobotTopic: (id: string, panelId: PanelId, topicName: string) => void;
}

export type ConnectionStore = ConnectionState & ConnectionActions;
