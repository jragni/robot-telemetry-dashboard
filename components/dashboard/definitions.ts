/**
 * Dashboard definitions
 */

// Interfaces
export interface TopicSubscription {
  lastMessage?: unknown
  messageType: string
  topicName: string
}

export interface RobotConnection {
  id: string,
  lastMessage?: string
  name: string,
  rosInstance?: ROSLIB.Ros
  status: ConnectionStatus
  subscriptions: TopicSubscription[]
  url: string
}

export interface ConnectionContextType {
  addConnection: (id: string, name:string, url: string) => Promise<void>,
  connections: Record<string, RobotConnection>
  disconnect: (id: string) => void
  reconnect: (id: string) => void
  removeConnection: (id: string) => void
  selectedConnectionId: string
  setSelectedConnectionId: (id: string) => void
  selectedConnection: RobotConnection | null
}

export interface ConnectionProviderProps {
  children: React.ReactNode
}

// Types

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'