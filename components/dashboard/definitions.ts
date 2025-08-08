/**
 * Dashboard definitions
 */

// Interfaces
export interface TopicSubscription {
  topicName: string
  messageType: string
  lastMessage?: unknown
  status: 'subscribing' | 'subscribed' | 'error'
}

export interface RobotConnection {
  id: string,
  lastMessage?: string
  name: string,
  rosInstance?: ROSLIB.Ros
  status: ConnectionStatus
  subscriptions: Record<string, TopicSubscription>
  url: string
}

export interface ConnectionContextType {
  addConnection: (id: string, name:string, url: string) => Promise<void>,
  connections: Record<string, RobotConnection>
  disconnect: (id: string) => void
  reconnect: (id: string) => void
  removeConnection: (id: string) => void
}

// Types

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'