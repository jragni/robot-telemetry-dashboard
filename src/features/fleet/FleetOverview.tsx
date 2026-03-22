import { useNavigate } from 'react-router';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRosStore } from '@/shared/stores/ros/ros.store';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

function statusVariant(state: string): BadgeVariant {
  if (state === 'connected') return 'default';
  if (state === 'error') return 'destructive';
  return 'secondary';
}

export function FleetOverview() {
  const navigate = useNavigate();
  const connectionStates = useRosStore((s) => s.connectionStates);
  const robotIds = Object.keys(connectionStates);

  return (
    <div className="flex h-full flex-col p-6">
      <h2 className="font-mono text-lg font-bold uppercase tracking-wider text-foreground">
        Fleet Overview
      </h2>

      {robotIds.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No robots connected. Add one via the sidebar.
        </p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {robotIds.map((id) => {
            const state = connectionStates[id]?.state ?? 'disconnected';
            return (
              <button
                key={id}
                type="button"
                onClick={() => void navigate(`/robot/${id}`)}
                className={cn(
                  'rounded border border-slate-700 bg-slate-800 p-4 text-left transition-colors',
                  'hover:border-slate-500 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm text-slate-200">{id}</span>
                  <Badge variant={statusVariant(state)} className="text-[10px]">
                    {state}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
