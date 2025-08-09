/**
 * Dashboard definitions
 */

// Interfaces
export interface TopicSubscription {
  lastMessage?: unknown
  messageType: string
  status: 'subscribing' | 'subscribed' | 'error' | 'unsubscribed'
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
  selectedConnectionId: string | null
  setSelectedConnectionId: (id: string | null) => void
  selectedConnection: RobotConnection | null
}

// Types

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'