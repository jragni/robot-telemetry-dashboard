export function MapView() {
  return (
    <div className="flex h-full flex-col p-6">
      <h2 className="font-mono text-lg font-bold uppercase tracking-wider text-foreground">
        SLAM Map
      </h2>
      <div className="mt-4 flex flex-1 items-center justify-center rounded border border-slate-700 bg-slate-800">
        <p className="text-sm text-slate-400">
          Connect a robot publishing OccupancyGrid to visualize the SLAM map.
        </p>
      </div>
    </div>
  );
}
