"use client";

import {
  createContext,
  useState,
  useContext
} from 'react';

interface TopicSubscription {
  id: string
  topicName: string
  messageType: string
  lastMessage?: any
  status: 'subscribing' | 'subscribed' | 'error'
}

interface RobotConnection {
  id: string,
  lastMessage?: string
  name: string,
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  subscriptions: Record<string, TopicSubscription>
}

interface ConnectionContextType {
  addConnection: (id: string, name:string, url: string) => void,
  connections: Record<string, RobotConnection>
  removeConnection: (id: string) => void,
}

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error('useConnection must be used in ConnectionContextProvider');
  return context;
}

/**
 * Connection Provider
 * 
 * @description
 * Connection context for the websocket connecting to devices running on ros2.
 */
export default function ConnectionProvider({ children }): { children: React.ReactNode } {
  return (
  );
}