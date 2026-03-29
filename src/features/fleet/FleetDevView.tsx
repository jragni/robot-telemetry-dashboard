import { Button } from '@/components/ui/button';
import { useConnectionStore } from '../../shared/stores/connection/useConnectionStore';
import { RobotCard } from './RobotCard/RobotCard';
import { FleetEmptyState } from './FleetEmptyState';
import { AddRobotModal } from './AddRobotModal';

export function FleetDevView() {
  const removeRobot = useConnectionStore((s) => s.removeRobot);
  const addRobot = useConnectionStore((s) => s.addRobot);

  function seedMockData() {
    addRobot('Atlas-01', 'wss://192.168.1.101:9090');
    addRobot('Hermes-02', 'wss://192.168.1.102:9090');
    addRobot('Ghost-04', 'wss://192.168.1.104:9090');

    const store = useConnectionStore.getState();
    store.updateRobot('atlas-01', { status: 'connected', latencyMs: 12 });
    store.updateRobot('hermes-02', { status: 'connected', latencyMs: 180 });
    store.updateRobot('ghost-04', { status: 'disconnected' });
  }

  function clearAll() {
    const store = useConnectionStore.getState();
    Object.keys(store.robots).forEach((id) => {
      store.removeRobot(id);
    });
  }

  const robots = Object.values(useConnectionStore((s) => s.robots));

  return (
    <div className="flex flex-col gap-8 p-4">
      <div>
        <h2 className="font-sans text-xl font-semibold text-text-primary mb-2">
          Component Viewer — Fleet
        </h2>
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={seedMockData}
            className="text-accent border-accent"
          >
            Seed Mock Data
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="text-status-critical border-status-critical"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div>
        <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
          Empty State
        </h3>
        <div className="bg-surface-primary border border-border rounded-sm">
          <FleetEmptyState
            onAddRobot={() => {
              /* noop — standalone preview */
            }}
          />
        </div>
      </div>

      <div>
        <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
          Robot Cards ({String(robots.length)})
        </h3>
        {robots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {robots.map((robot) => (
              <RobotCard key={robot.id} robot={robot} onRemove={removeRobot} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-xs text-text-muted">
            No robots — click &quot;Seed Mock Data&quot; above
          </p>
        )}
      </div>

      <div>
        <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
          Add Robot Modal
        </h3>
        <AddRobotModal />
      </div>
    </div>
  );
}
