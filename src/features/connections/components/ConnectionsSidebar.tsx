import { useState } from 'react';

import { AddRobotForm } from './AddRobotForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { RobotRow } from './RobotRow';

import { useFleetConnectionManager } from '@/hooks/useFleetConnectionManager';
import { useConnectionsStore } from '@/stores/connections/connections.store';
import type { RobotConnection } from '@/types/connection.types';

/**
 * Left sidebar that lists all configured robots with status, connect/disconnect
 * actions, active robot selection, and an inline Add Robot form.
 */
export function ConnectionsSidebar() {
  const robots = useConnectionsStore((s) => s.robots);
  const activeRobotId = useConnectionsStore((s) => s.activeRobotId);

  const { connectRobot, disconnectRobot } = useFleetConnectionManager();

  const [pendingDelete, setPendingDelete] = useState<RobotConnection | null>(
    null
  );

  // Use getState() calls inside handlers to avoid @typescript-eslint/unbound-method
  // warnings that arise when Zustand methods are extracted via selectors.
  function handleSetActiveRobot(id: string) {
    useConnectionsStore.getState().setActiveRobot(id);
  }

  function handleDeleteConfirm() {
    if (!pendingDelete) return;
    disconnectRobot(pendingDelete.id);
    useConnectionsStore.getState().removeRobot(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <>
      <nav
        aria-label="Robot connections"
        className="flex h-full flex-col overflow-hidden"
      >
        {/* Section header */}
        <div className="shrink-0 border-b border-sidebar-border px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Connections
          </span>
        </div>

        {/* Robot list */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
          {robots.length === 0 && (
            <p className="px-1 py-3 text-xs italic text-muted-foreground">
              No robots configured yet.
            </p>
          )}

          {robots.map((robot) => (
            <RobotRow
              key={robot.id}
              robot={robot}
              isActive={robot.id === activeRobotId}
              onSelect={handleSetActiveRobot}
              onConnect={connectRobot}
              onDisconnect={disconnectRobot}
              onDeleteRequest={setPendingDelete}
            />
          ))}
        </div>

        {/* Add Robot form pinned to the bottom of the sidebar */}
        <div className="shrink-0 border-t border-sidebar-border">
          <AddRobotForm />
        </div>
      </nav>

      {/* Delete confirmation dialog (rendered via portal-like positioning) */}
      {pendingDelete !== null && (
        <DeleteConfirmDialog
          robot={pendingDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
