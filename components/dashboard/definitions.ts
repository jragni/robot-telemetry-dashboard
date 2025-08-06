/**
 * Dashboard definitions
 */

export interface TopicSubscription {
  id: string
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
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  subscriptions: Record<string, TopicSubscription>
  url: string
}

export interface ConnectionContextType {
  addConnection: (id: string, name:string, url: string) => void,
  connections: Record<string, RobotConnection>
  removeConnection: (id: string) => void,
}