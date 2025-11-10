/**
 * RosContext
 *
 * Global context provider for ROS connection management.
 * Manages multiple robot connections and provides ROS instance to all components.
 */

import { createContext, useContext, useState } from 'react';

import type { ConnectionState, ROSLIB, RobotConnection } from './definitions';
import { useRos } from './useRos';

interface RosContextValue {
  ros: ROSLIB.Ros | null;
  connectionState: ConnectionState;
  error: Error | null;
  robots: RobotConnection[];
  activeRobotId: string | null;
  activeRobot: RobotConnection | null;
  addRobot: (name: string, url: string) => void;
  selectRobot: (robotId: string) => void;
  deleteRobot: (robotId: string) => void;
  connect: () => void;
  disconnect: () => void;
}

const RosContext = createContext<RosContextValue | undefined>(undefined);

interface RosProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY_ROBOTS = 'robots';
const STORAGE_KEY_ACTIVE_ROBOT = 'active_robot_id';

export function RosProvider({ children }: RosProviderProps) {
  // Load robots from localStorage on mount
  const [robots, setRobots] = useState<RobotConnection[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_ROBOTS);
      return stored ? (JSON.parse(stored) as RobotConnection[]) : [];
    }
    return [];
  });

  // Load active robot ID from localStorage
  const [activeRobotId, setActiveRobotId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_ACTIVE_ROBOT);
    }
    return null;
  });

  const activeRobot = robots.find((r) => r.id === activeRobotId) ?? null;

  const { ros, connectionState, error, connect, disconnect } = useRos({
    url: activeRobot?.url ?? '',
    autoConnect: false, // Don't auto-connect, let user trigger it
  });

  // Add a new robot
  const addRobot = (name: string, url: string) => {
    const newRobot: RobotConnection = {
      id: `robot-${Date.now()}`,
      name,
      url,
      addedAt: Date.now(),
    };

    const updatedRobots = [...robots, newRobot];
    setRobots(updatedRobots);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ROBOTS, JSON.stringify(updatedRobots));
    }

    // Auto-select the first robot if none is selected
    if (!activeRobotId) {
      selectRobot(newRobot.id);
    }
  };

  // Select a robot
  const selectRobot = (robotId: string) => {
    setActiveRobotId(robotId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ROBOT, robotId);
    }
  };

  // Delete a robot
  const deleteRobot = (robotId: string) => {
    const updatedRobots = robots.filter((r) => r.id !== robotId);
    setRobots(updatedRobots);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ROBOTS, JSON.stringify(updatedRobots));
    }

    // If deleting the active robot, select the first available or null
    if (activeRobotId === robotId) {
      const newActiveId = updatedRobots.length > 0 ? updatedRobots[0].id : null;
      setActiveRobotId(newActiveId);
      if (typeof window !== 'undefined') {
        if (newActiveId) {
          localStorage.setItem(STORAGE_KEY_ACTIVE_ROBOT, newActiveId);
        } else {
          localStorage.removeItem(STORAGE_KEY_ACTIVE_ROBOT);
        }
      }
    }
  };

  const value: RosContextValue = {
    ros,
    connectionState,
    error,
    robots,
    activeRobotId,
    activeRobot,
    addRobot,
    selectRobot,
    deleteRobot,
    connect,
    disconnect,
  };

  return <RosContext.Provider value={value}>{children}</RosContext.Provider>;
}

export function useRosContext() {
  const context = useContext(RosContext);
  if (context === undefined) {
    throw new Error('useRosContext must be used within a RosProvider');
  }
  return context;
}
