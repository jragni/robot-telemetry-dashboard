'use client';

import {
  createContext,
  useEffect,
  useState,
  useContext,
} from 'react';

import {
  ConnectionProviderProps,
  ConnectionContextType,
  RobotConnection,
  TopicSubscription,
} from './definitions';

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
 * Prioritizes control commands over streaming data for optimal robot responsiveness.
 */
export default function ConnectionProvider({ children }: ConnectionProviderProps): React.ReactNode {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [connections, setConnections] = useState<Record<string, RobotConnection>>({});
  const selectedConnection = selectedConnectionId
    ? connections[selectedConnectionId] ?? null
    : null;

  useEffect(() => {
    if (Object.keys(connections).length === 1) {
      setSelectedConnectionId(Object.keys(connections)[0]);
    }
  }, [connections]);

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
          },
        }));
        reject(new Error('Connection timeout'));
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
            subscriptions: [],
          },
        }));

        // TODO Delete and move later, use for testing
        rosInstance.getTopics(
          ({ topics, types }) => {
            const subs: TopicSubscription[] = topics.map((topic, idx) => ({
              lastMessage: null,
              messageType: types[idx],
              topicName: topic,
            }));

            setConnections((prev) => ({
              ...prev,
              [id]: {
                ...prev[id],
                subscriptions: subs,
              },
            }));
          },
          (error) => { console.log('Error fetching topics:', error); },
        );

        resolve();
      };

      const onError = (err?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(err instanceof Error ? err : new Error('Connection error'));
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
          },
        }));
        reject(new Error('Connection closed'));
      };

      // Optimize for control command priority
      if ((rosInstance as any).socket) {
        (rosInstance as any).socket.binaryType = 'arraybuffer';
      }

      rosInstance.on('connection', onConnection);
      rosInstance.on('error', onError);
      rosInstance.on('close', onClose);
    });
  };

  const disconnect = (id: string): void => {
    const connection = connections[id];
    if (connection?.rosInstance) {
      connection.rosInstance.close();
      setConnections(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: 'disconnected',
        },
      }));
    }
  };

  const reconnect = (id: string): void => {
    const connection = connections[id];
    if (connection?.rosInstance) {
      connection.rosInstance.connect(connection.url);
      setConnections(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          status: 'connected',
        },
      }));
    }
  };

  const removeConnection = (id: string): void => {
    const connection = connections[id];
    if (connection?.rosInstance) {
      connection.rosInstance.close();

      setConnections((prev) => {
        const { [id]: removed, ...rest } = prev;
        console.log('Removing connection:', removed);
        return rest;
      });

      // Clear selection if the removed connection was selected
      setSelectedConnectionId((currentId) => (currentId === id ? '' : currentId));
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
        selectedConnectionId,
        setSelectedConnectionId,
        selectedConnection,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
}