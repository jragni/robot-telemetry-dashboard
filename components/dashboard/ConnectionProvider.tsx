"use client";

import {
  createContext,
  useState,
  useContext,
} from 'react';

import { ConnectionContextType, RobotConnection } from './definitions';

const ConnectionContext = createContext<ConnectionContextType | null>(null);

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (!context) throw new Error('useConnection must be used in ConnectionContextProvider');
  return context;
}

interface ConnectionProviderProps {
  children: React.ReactNode
}

/**
 * Connection Provider
 *
 * @description
 * Connection context for the websocket connecting to devices running on ros2.
 */
export default function ConnectionProvider({ children }: ConnectionProviderProps): React.ReactNode {
  const [connections, setConnections] = useState<Record<string,RobotConnection>>({});

  const addConnection = async (id: string, name: string, webSocketUrl: string) => {
    const ROSLIB = (await import('roslib')).default;
    const rosInstance = new ROSLIB.Ros({ url: webSocketUrl });

    rosInstance.on('connection', () => {
      setConnections((prev) => ({
        ...prev,
        [id]: {
          id,
          name,
          rosInstance,
          url: webSocketUrl,
          status: 'connected',
          subscriptions: {}
        }
      }));
    });

    rosInstance.getTopics((result) => {
      console.log(result.topics, result.types); // TODO update and fill in
    }, (error) => {
      console.log('boop', error);
    });
  };

  // TODO: fill in
  const removeConnection = () => null;

  return (
    <ConnectionContext.Provider
      value={{
        addConnection,
        connections,
        removeConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}