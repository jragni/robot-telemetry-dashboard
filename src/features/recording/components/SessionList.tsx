import { exportSessionAsCsv, exportSessionAsJson } from '../export.utils';
import { useRecording } from '../hooks/useRecording';
import type { RecordingSession } from '../recording.types';

import type { SessionListProps } from './SessionList.types';
import { SessionRow } from './SessionRow';

// ---------------------------------------------------------------------------
// SessionList
// ---------------------------------------------------------------------------

/**
 * Lists all past recording sessions with delete, play and export actions.
 */
export function SessionList({ robotId, onPlaySession }: SessionListProps) {
  const { sessions, deleteSession, refreshSessions } = useRecording(robotId);

  // We need messages to export — fetch on demand.
  // Import the recording service singleton lazily to avoid circular deps.
  async function handleExport(
    session: RecordingSession,
    format: 'json' | 'csv'
  ) {
    // Dynamically access the shared service to get messages.
    const { RecordingService } = await import('../recording.service');
    const svc = new RecordingService();
    await svc.initialize();
    const messages = await svc.getSessionMessages(session.id);

    if (format === 'json') {
      exportSessionAsJson(session, messages);
    } else {
      exportSessionAsCsv(session, messages);
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="p-3 text-xs text-muted-foreground italic">
        No recordings yet.
        <button
          type="button"
          onClick={refreshSessions}
          className="ml-2 underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center justify-between px-1 mb-1">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          Sessions ({sessions.length})
        </p>
        <button
          type="button"
          onClick={refreshSessions}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          Refresh
        </button>
      </div>

      {sessions.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          onDelete={deleteSession}
          onPlay={onPlaySession}
          onExportJson={(s) => void handleExport(s, 'json')}
          onExportCsv={(s) => void handleExport(s, 'csv')}
        />
      ))}
    </div>
  );
}
