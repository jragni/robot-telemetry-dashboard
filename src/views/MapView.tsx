import { PanelGrid } from '@/features/panels/components/PanelGrid';
import { PanelToolbar } from '@/features/panels/components/PanelToolbar';
import { useConnectionsStore } from '@/stores/connections/connections.store';

export function MapView() {
  const activeRobotId = useConnectionsStore((s) => s.activeRobotId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PanelToolbar viewId="map" />
      <div className="flex-1 overflow-auto">
        <PanelGrid viewId="map" robotId={activeRobotId ?? undefined} />
      </div>
    </div>
  );
}
