/**
 * ControlContext
 *
 * Shared context for control state across Control Panel and Pilot Mode.
 * Allows synchronization of velocity settings and active state.
 */

import { createContext, useContext, useState } from 'react';

import { CMD_VEL_MESSAGE_TYPE, VELOCITY_LIMITS } from './constants';
import type { ControlState, Direction } from './definitions';

import type { TwistMessage } from '@/contexts/ros/definitions';
import { usePublisher } from '@/hooks/ros/usePublisher';

interface ControlContextValue {
  controlState: ControlState;
  setControlState: (state: ControlState) => void;
  updateLinearVelocity: (value: number) => void;
  updateAngularVelocity: (value: number) => void;
  updateSelectedTopic: (topic: string) => void;
  handleDirectionPress: (direction: Direction) => void;
  handleEmergencyStop: () => void;
  isReady: boolean;
}

const ControlContext = createContext<ControlContextValue | undefined>(
  undefined
);

export function ControlProvider({ children }: { children: React.ReactNode }) {
  const [controlState, setControlState] = useState<ControlState>({
    linearVelocity: VELOCITY_LIMITS.linear.default,
    angularVelocity: VELOCITY_LIMITS.angular.default,
    isActive: false,
    selectedTopic: '/cmd_vel', // Default to /cmd_vel
  });

  const { publish, isReady } = usePublisher<TwistMessage>({
    topic: controlState.selectedTopic,
    messageType: CMD_VEL_MESSAGE_TYPE,
  });

  const sendTwistCommand = (linear: number, angular: number) => {
    const message: TwistMessage = {
      linear: { x: linear, y: 0, z: 0 },
      angular: { x: 0, y: 0, z: angular },
    };
    publish(message);
  };

  const handleDirectionPress = (direction: Direction) => {
    setControlState((prev) => ({ ...prev, isActive: direction !== 'stop' }));

    if (!isReady) return;

    switch (direction) {
      case 'forward':
        sendTwistCommand(controlState.linearVelocity, 0);
        break;
      case 'backward':
        sendTwistCommand(-controlState.linearVelocity, 0);
        break;
      case 'left':
        sendTwistCommand(0, controlState.angularVelocity);
        break;
      case 'right':
        sendTwistCommand(0, -controlState.angularVelocity);
        break;
      case 'stop':
        sendTwistCommand(0, 0);
        break;
    }
  };

  const handleEmergencyStop = () => {
    setControlState((prev) => ({ ...prev, isActive: false }));
    if (isReady) {
      sendTwistCommand(0, 0);
    }
  };

  const updateLinearVelocity = (value: number) => {
    setControlState((prev) => ({ ...prev, linearVelocity: value }));
  };

  const updateAngularVelocity = (value: number) => {
    setControlState((prev) => ({ ...prev, angularVelocity: value }));
  };

  const updateSelectedTopic = (topic: string) => {
    setControlState((prev) => ({ ...prev, selectedTopic: topic }));
  };

  return (
    <ControlContext.Provider
      value={{
        controlState,
        setControlState,
        updateLinearVelocity,
        updateAngularVelocity,
        updateSelectedTopic,
        handleDirectionPress,
        handleEmergencyStop,
        isReady,
      }}
    >
      {children}
    </ControlContext.Provider>
  );
}

export function useControl() {
  const context = useContext(ControlContext);
  if (context === undefined) {
    throw new Error('useControl must be used within a ControlProvider');
  }
  return context;
}
