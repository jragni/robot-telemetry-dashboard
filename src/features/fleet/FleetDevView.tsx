import { useConnectionStore } from '../../shared/stores/connection/useConnectionStore';
import { RobotCard } from './RobotCard';
import { FleetEmptyState } from './FleetEmptyState';
import { AddRobotModal } from './AddRobotModal';

/**
 * Dev-only component viewer for fleet components.
 * Shows each component in isolation with mock data.
 * Route: /dev/components
 */
export function FleetDevView() {
  const removeRobot = useConnectionStore((s) => s.removeRobot);
  const addRobot = useConnectionStore((s) => s.addRobot);

  function seedMockData() {
    addRobot('Atlas-01', 'wss://192.168.1.101:9090');
    addRobot('Hermes-02', 'wss://192.168.1.102:9090');
    addRobot('Ghost-04', 'wss://192.168.1.104:9090');

    // Set varied statuses via updateRobot
    const store = useConnectionStore.getState();
    store.updateRobot('atlas-01', { status: 'nominal', latencyMs: 12 });
    store.updateRobot('hermes-02', { status: 'caution', latencyMs: 180 });
    store.updateRobot('ghost-04', { status: 'offline' });
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
          <button
            type="button"
            onClick={seedMockData}
            className="font-mono text-xs text-accent border border-accent rounded-sm px-3 py-1 cursor-pointer hover:bg-accent-subtle transition-colors duration-200"
          >
            Seed Mock Data
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="font-mono text-xs text-status-critical border border-status-critical rounded-sm px-3 py-1 cursor-pointer hover:bg-status-critical-bg transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Empty State */}
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

      {/* Robot Cards */}
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
            No robots — click "Seed Mock Data" above
          </p>
        )}
      </div>

      {/* Add Robot Modal */}
      <div>
        <h3 className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
          Add Robot Modal
        </h3>
        <AddRobotModal />
      </div>
    </div>
  );
}
