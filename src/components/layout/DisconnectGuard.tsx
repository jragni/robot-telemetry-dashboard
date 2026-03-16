import { useDisconnectHandler } from '@/features/connections/hooks/useDisconnectHandler';
import { useConnectionsStore } from '@/stores/connections.store';

/**
 * Invisible component that activates disconnect safety monitoring for the
 * currently active robot. Rendered inside DashboardShell so it is always
 * present while any dashboard view is open.
 */
export function DisconnectGuard() {
  const activeRobotId = useConnectionsStore((s) => s.activeRobotId);
  useDisconnectHandler(activeRobotId ?? '');
  return null;
}
