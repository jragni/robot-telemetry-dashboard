import type { EmptyStateProps } from './EmptyState.types';

export function EmptyState({ mode }: EmptyStateProps) {
  if (mode === 'dashboard') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-slate-300">
          No robots connected — connect a robot to begin
        </p>
        <button
          type="button"
          className="rounded border border-blue-600 px-3 py-1.5 text-xs text-blue-400 hover:bg-blue-900/30"
        >
          Connect Robot
        </button>
      </div>
    );
  }

  if (mode === 'pilot') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-slate-300">
          No robot selected — select a robot from the fleet panel
        </p>
      </div>
    );
  }

  return (
    <div className="rounded border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-400">
      Connect a robot to see live data
    </div>
  );
}
