import type { UseRosConnectionResult } from './useRosConnection.types';

import { useRosStore } from '@/shared/stores/ros/ros.store';

export function useRosConnection(robotId: string): UseRosConnectionResult {
  const connectionState = useRosStore(
    (state) => state.connectionStates[robotId]?.state ?? 'disconnected'
  );

  return {
    isConnected: connectionState === 'connected',
    connectionState,
    transport: null,
  };
}
