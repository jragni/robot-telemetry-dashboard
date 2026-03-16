import { useState } from 'react';

import { FleetGrid } from '@/features/fleet/components/FleetGrid';
import { SplitPilotGrid } from '@/features/fleet/components/SplitPilotGrid';
import { UnifiedCommandPanel } from '@/features/fleet/components/UnifiedCommandPanel';
import { useFleetStatus } from '@/features/fleet/hooks/useFleetStatus';
import { useMobile } from '@/hooks/use-mobile';

// ---------------------------------------------------------------------------
// FleetView
// ---------------------------------------------------------------------------

/**
 * Phase 9: Multi-Robot & Fleet overview.
 *
 * Desktop layout (≥768 px):
 *   ┌─────────────────┬──────────────────────────────┐
 *   │ FleetGrid (1/3) │ SplitPilotGrid (2/3)         │
 *   │                 ├──────────────────────────────┤
 *   │                 │ UnifiedCommandPanel           │
 *   └─────────────────┴──────────────────────────────┘
 *
 * Mobile layout:
 *   - FleetGrid stacked full-width
 *   - SplitPilotGrid and UnifiedCommandPanel hidden (too small to be useful)
 */
export function FleetView() {
  const isMobile = useMobile();
  const [selectedRobotId, setSelectedRobotId] = useState<string | null>(null);

  const { robots } = useFleetStatus();

  // ---- Mobile ----
  if (isMobile) {
    return (
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Fleet Overview
        </h1>
        <FleetGrid
          selectedRobotId={selectedRobotId}
          onSelectRobot={setSelectedRobotId}
        />
      </div>
    );
  }

  // ---- Desktop ----
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left sidebar: robot list */}
      <aside className="flex w-1/3 min-w-[260px] max-w-[360px] flex-col gap-4 overflow-y-auto border-r border-border p-4">
        <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Fleet Overview
        </h1>
        <FleetGrid
          selectedRobotId={selectedRobotId}
          onSelectRobot={setSelectedRobotId}
        />
      </aside>

      {/* Right panel: split pilot views + unified command */}
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {/* Split pilot grid — connected robots */}
        <div className="flex-1 min-h-0">
          <SplitPilotGrid
            robots={robots}
            selectedRobotId={selectedRobotId}
            onSelectRobot={setSelectedRobotId}
          />
        </div>

        {/* Unified command panel */}
        <UnifiedCommandPanel robots={robots} />
      </main>
    </div>
  );
}
