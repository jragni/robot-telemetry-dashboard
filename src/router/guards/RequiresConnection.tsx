import { Navigate } from 'react-router';

import type { RequiresConnectionProps } from './RequiresConnection.types';

import { useConnectionsStore } from '@/stores/connections.store';
import { useRosStore } from '@/stores/ros.store';

export function RequiresConnection({ children }: RequiresConnectionProps) {
  const activeRobotId = useConnectionsStore((s) => s.activeRobotId);
  const connectionState = useRosStore((s) =>
    activeRobotId ? s.getConnectionState(activeRobotId) : 'disconnected'
  );

  if (!activeRobotId || connectionState !== 'connected') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
