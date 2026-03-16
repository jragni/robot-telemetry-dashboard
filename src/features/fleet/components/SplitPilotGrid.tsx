import { MiniPilotView } from './MiniPilotView';
import type { SplitPilotGridProps } from './SplitPilotGrid.types';

import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Grid column helpers
// ---------------------------------------------------------------------------

/**
 * Returns the appropriate Tailwind grid-cols class for N robots.
 * - 1 robot  → single column
 * - 2 robots → 2 columns
 * - 3-4      → 2x2
 * - 5-6      → 3x2
 */
function gridColsClass(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count <= 4) return 'grid-cols-2';
  return 'grid-cols-3';
}

// ---------------------------------------------------------------------------
// SplitPilotGrid
// ---------------------------------------------------------------------------

/**
 * Responsive grid of MiniPilotView cells — one per connected robot.
 *
 * Layout adapts automatically:
 * - 1 robot  → 1×1
 * - 2 robots → 2×1
 * - 3-4      → 2×2
 * - 5-6      → 3×2
 *
 * The selected robot cell is highlighted with a primary-color border.
 */
export function SplitPilotGrid({
  robots,
  selectedRobotId,
  onSelectRobot,
}: SplitPilotGridProps) {
  if (robots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          No robots connected
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="split-pilot-grid"
      className={cn('grid gap-2 h-full', gridColsClass(robots.length))}
    >
      {robots.map((status) => (
        <MiniPilotView
          key={status.robot.id}
          status={status}
          isSelected={selectedRobotId === status.robot.id}
          onSelect={onSelectRobot}
        />
      ))}
    </div>
  );
}
