import { PanelGrid } from '@/features/panels/components/PanelGrid';
import { useConnectionsStore } from '@/stores/connections/connections.store';

export function MapView() {
  const activeRobotId = useConnectionsStore((s) => s.activeRobotId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PanelGrid viewId="map" robotId={activeRobotId ?? undefined} />
    </div>
  );
}
