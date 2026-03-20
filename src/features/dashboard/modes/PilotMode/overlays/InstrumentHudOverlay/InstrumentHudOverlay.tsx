import type { InstrumentHudOverlayProps } from './InstrumentHudOverlay.types';

import { useRosConnection } from '@/features/telemetry/hooks/useRosConnection';

export function InstrumentHudOverlay({ robotId }: InstrumentHudOverlayProps) {
  const { isConnected: _isConnected } = useRosConnection(robotId);

  return (
    <div
      data-testid="instrument-hud-overlay"
      data-position="right"
      className="absolute right-2 top-2 z-20 flex flex-col gap-1"
    >
      <div className="rounded bg-black/60 px-2 py-1 text-xs text-blue-300">
        <span className="text-slate-400">Heading</span>{' '}
        <span className="font-mono">—</span>
      </div>
      <div className="rounded bg-black/60 px-2 py-1 text-xs text-blue-300">
        <span className="text-slate-400">Vel</span>{' '}
        <span className="font-mono">—</span>
      </div>
      <div className="rounded bg-black/60 px-2 py-1 text-xs text-blue-300">
        <span className="text-slate-400">Batt</span>{' '}
        <span className="font-mono">—</span>
      </div>
    </div>
  );
}
