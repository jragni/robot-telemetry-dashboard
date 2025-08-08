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
  const [connections, setConnections] = useState<Record<string, RobotConnection>>({});

  const addConnection = async (id: string, name: string, webSocketUrl: string) => {
    const ROSLIB = (await import('roslib')).default;

    return new Promise<void>((resolve, reject) => {
      const rosInstance = new ROSLIB.Ros({ url: webSocketUrl });


      let settled = false;
      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        rosInstance.close();
        setConnections(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            status: 'error',
          }
        }));
        reject(new Error('connection timeout'));
      }, 10000);

      const onConnection = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        setConnections(prev => ({
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

        // TODO Delete and move late, use for testing
        rosInstance.getTopics(
          (result) => { console.log(result.topics, result.types); },
          (error) => { console.log('boop', error); }
        );

        resolve();
      };

      const onError = (err?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(err instanceof Error ? err : new Error('connection error'));
      };

      const onClose = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        setConnections(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            status: 'disconnected',
          }
        }));
        reject(new Error('connection closed'));
      };

      rosInstance.on('connection', onConnection);
      rosInstance.on('error', onError);
      rosInstance.on('close', onClose);
    });
  };

  const disconnect = (id: string): void => {
    const connection = connections[id];
    if (connection && connection.rosInstance) {
      connection.rosInstance.close();
      setConnections(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: 'disconnected',
        }
      }))
    }
  };

  const reconnect = (id: string): void => {
    const connection = connections[id];
    if (connection && connection.rosInstance) {
      connection.rosInstance.connect(connection.url);
      setConnections(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: 'connected',
        }
      }))
    }
  };

  const removeConnection = (id: string): void => {
    const connection = connections[id];
    if (connection && connection.rosInstance) {
      connection.rosInstance.close();

      setConnections((prev) => {
        const { [id]: removed, ...rest } = prev;
        console.log('removing', removed)
        return rest;
      });
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        addConnection,
        disconnect,
        connections,
        reconnect,
        removeConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}