import { useRosStore } from '@/shared/stores/ros/ros.store';

export function FleetView() {
  const connectionStates = useRosStore((s) => s.connectionStates);
  const robotIds = Object.keys(connectionStates);

  return (
    <div className="flex h-full flex-col p-6">
      <h2 className="font-mono text-lg font-bold uppercase tracking-wider text-foreground">
        Fleet Overview
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {robotIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No robots connected. Connect a robot via the ROS bridge to see fleet
            status.
          </p>
        ) : (
          robotIds.map((id) => {
            const state = connectionStates[id]?.state ?? 'disconnected';
            return (
              <div
                key={id}
                className="rounded border border-slate-700 bg-slate-800 p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      state === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="font-mono text-sm text-slate-200">{id}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{state}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
