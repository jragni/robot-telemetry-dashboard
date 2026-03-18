import { PanelGrid } from '@/features/panels/components/PanelGrid';
import { useConnectionsStore } from '@/stores/connections/connections.store';

export function DashboardView() {
  const activeRobotId = useConnectionsStore((s) => s.activeRobotId);

  return (
    <div className="flex flex-1 overflow-hidden">
      <PanelGrid viewId="dashboard" robotId={activeRobotId ?? undefined} />
    </div>
  );
}
