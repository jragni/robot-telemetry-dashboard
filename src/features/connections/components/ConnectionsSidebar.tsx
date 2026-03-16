import { Radio, Trash2, Unplug } from 'lucide-react';
import { useState } from 'react';

import { AddRobotForm } from './AddRobotForm';

import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { useFleetConnectionManager } from '@/features/fleet/hooks/useFleetConnectionManager';
import { cn } from '@/lib/utils';
import { useConnectionsStore } from '@/stores/connections.store';
import { useRosStore } from '@/stores/ros.store';
import type { RobotConnection } from '@/types';

// ---------------------------------------------------------------------------
// DeleteConfirmDialog
// ---------------------------------------------------------------------------

interface DeleteConfirmDialogProps {
  robot: RobotConnection;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmDialog({
  robot,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="w-full max-w-sm rounded-sm border border-border bg-card p-5 shadow-xl">
        <h2
          id="delete-dialog-title"
          className="mb-2 font-mono text-sm font-semibold text-foreground"
        >
          Remove Robot
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Remove{' '}
          <span className="font-semibold text-foreground">{robot.name}</span>?
          This will disconnect it and delete its configuration.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded text-xs font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-xs font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RobotRow
// ---------------------------------------------------------------------------

interface RobotRowProps {
  robot: RobotConnection;
  isActive: boolean;
  onSelect: (id: string) => void;
  onConnect: (id: string) => void;
  onDisconnect: (id: string) => void;
  onDeleteRequest: (robot: RobotConnection) => void;
}

function RobotRow({
  robot,
  isActive,
  onSelect,
  onConnect,
  onDisconnect,
  onDeleteRequest,
}: RobotRowProps) {
  const connectionState = useRosStore((s) => s.getConnectionState(robot.id));
  const isConnected = connectionState === 'connected';

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(robot.id);
    }
  }

  return (
    <div
      data-testid={`robot-row-${robot.id}`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(robot.id)}
      onKeyDown={handleKeyDown}
      aria-label={`Select robot ${robot.name}`}
      aria-pressed={isActive}
      className={cn(
        'group flex flex-col gap-1.5 rounded-sm border p-2.5 cursor-pointer transition-colors',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      {/* Name + status indicator */}
      <div className="flex items-center gap-2 min-w-0">
        <StatusIndicator state={connectionState} />
        <span className="flex-1 truncate font-mono text-xs font-semibold text-foreground">
          {robot.name}
        </span>
      </div>

      {/* Base URL */}
      <span className="truncate font-mono text-[10px] text-muted-foreground">
        {robot.baseUrl}
      </span>

      {/* Action row */}
      <div className="flex items-center gap-1 mt-0.5">
        {/* Connect / Disconnect */}
        {isConnected ? (
          <button
            type="button"
            aria-label={`Disconnect ${robot.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDisconnect(robot.id);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted hover:bg-muted/80 text-foreground transition-colors"
          >
            <Unplug className="w-2.5 h-2.5" aria-hidden="true" />
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            aria-label={`Connect ${robot.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onConnect(robot.id);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          >
            <Radio className="w-2.5 h-2.5" aria-hidden="true" />
            Connect
          </button>
        )}

        {/* Delete */}
        <button
          type="button"
          aria-label={`Delete ${robot.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRequest(robot);
          }}
          className="ml-auto flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
        >
          <Trash2 className="w-2.5 h-2.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConnectionsSidebar
// ---------------------------------------------------------------------------

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
