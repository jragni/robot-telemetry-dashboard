import { useState } from 'react';

import { useUnifiedControl } from '../hooks/useUnifiedControl';

import type { UnifiedCommandPanelProps } from './UnifiedCommandPanel.types';

import { Button } from '@/components/ui/button';
import { ControlPad } from '@/features/control/components/ControlPad';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// UnifiedCommandPanel
// ---------------------------------------------------------------------------

/**
 * Broadcasts directional commands to a user-selected subset of robots
 * simultaneously.
 *
 * Layout:
 * - Robot checkbox list (select which robots receive commands)
 * - "Select All" / "Deselect All" convenience buttons
 * - Shared ControlPad that broadcasts the same command to all selected robots
 *
 * The ControlPad is rendered with the first selected robot's id so the
 * underlying useControlPublisher resolves velocity config; the useUnifiedControl
 * hook handles the actual multi-robot broadcast.
 */
export function UnifiedCommandPanel({ robots }: UnifiedCommandPanelProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const selectedRobotIds = Array.from(selectedIds);
  const { isReady } = useUnifiedControl(selectedRobotIds);

  // ---- Selection helpers ----

  function toggleRobot(robotId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(robotId)) {
        next.delete(robotId);
      } else {
        next.add(robotId);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(robots.map((r) => r.robot.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  const firstSelectedId = selectedRobotIds[0];

  return (
    <div
      data-testid="unified-command-panel"
      className="flex flex-col gap-4 rounded-sm border border-border bg-card p-4 border-l-2 border-l-primary"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
          Unified Command
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] font-mono uppercase tracking-wider"
            onClick={selectAll}
            aria-label="Select all robots"
          >
            All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] font-mono uppercase tracking-wider"
            onClick={deselectAll}
            aria-label="Deselect all robots"
          >
            None
          </Button>
        </div>
      </div>

      {/* Robot selection checkboxes */}
      {robots.length === 0 ? (
        <p className="font-mono text-[10px] text-muted-foreground">
          No robots configured.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {robots.map((status) => {
            const id = `unified-cmd-${status.robot.id}`;
            const isChecked = selectedIds.has(status.robot.id);

            return (
              <label
                key={status.robot.id}
                htmlFor={id}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-colors',
                  'hover:bg-muted/50',
                  isChecked && 'bg-primary/10'
                )}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleRobot(status.robot.id)}
                  className="accent-primary"
                  aria-label={`Include ${status.robot.name} in unified command`}
                />
                <span className="font-mono text-xs text-foreground">
                  {status.robot.name}
                </span>
                <span
                  className={cn(
                    'ml-auto h-1.5 w-1.5 rounded-full',
                    status.isConnected
                      ? 'bg-status-nominal'
                      : 'bg-status-offline'
                  )}
                />
              </label>
            );
          })}
        </div>
      )}

      {/* Status */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            isReady ? 'bg-status-nominal' : 'bg-status-offline'
          )}
        />
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {selectedRobotIds.length === 0
            ? 'No robots selected'
            : isReady
              ? `Broadcasting to ${selectedRobotIds.length} robot${selectedRobotIds.length > 1 ? 's' : ''}`
              : 'Waiting for connections'}
        </span>
      </div>

      {/* Control pad — broadcasts to all selected robots */}
      <div
        className={cn(
          'transition-opacity',
          selectedRobotIds.length === 0 && 'pointer-events-none opacity-40'
        )}
      >
        <ControlPad robotId={firstSelectedId} />
      </div>
    </div>
  );
}
