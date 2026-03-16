import { Download, Play, Trash2 } from 'lucide-react';

import { exportSessionAsCsv, exportSessionAsJson } from '../export.utils';
import { useRecording } from '../hooks/useRecording';
import type { RecordingSession } from '../recording.types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SessionListProps {
  robotId: string | undefined;
  onPlaySession?: (sessionId: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(startedAt: number, endedAt: number | null): string {
  if (endedAt === null) return 'In progress';
  const ms = endedAt - startedAt;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes > 0) {
    return `${String(minutes)}m ${String(remaining).padStart(2, '0')}s`;
  }
  return `${String(seconds)}s`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

// ---------------------------------------------------------------------------
// SessionRow
// ---------------------------------------------------------------------------

interface SessionRowProps {
  session: RecordingSession;
  onDelete: (id: string) => void;
  onPlay?: (id: string) => void;
  onExportJson: (session: RecordingSession) => void;
  onExportCsv: (session: RecordingSession) => void;
}

function SessionRow({
  session,
  onDelete,
  onPlay,
  onExportJson,
  onExportCsv,
}: SessionRowProps) {
  return (
    <div className="flex flex-col gap-1 p-2 rounded border border-border bg-card text-card-foreground">
      {/* Name and date */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium truncate">{session.name}</span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(session.startedAt)}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{formatDuration(session.startedAt, session.endedAt)}</span>
        <span>{session.messageCount.toLocaleString()} msg</span>
        <span>{formatSize(session.sizeBytes)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 mt-1">
        {onPlay && (
          <button
            type="button"
            onClick={() => onPlay(session.id)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            title="Play session"
          >
            <Play className="w-3 h-3" />
            Play
          </button>
        )}

        <button
          type="button"
          onClick={() => onExportJson(session)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80 text-foreground transition-colors"
          title="Export as JSON"
        >
          <Download className="w-3 h-3" />
          JSON
        </button>

        <button
          type="button"
          onClick={() => onExportCsv(session)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-muted hover:bg-muted/80 text-foreground transition-colors"
          title="Export as CSV"
        >
          <Download className="w-3 h-3" />
          CSV
        </button>

        <button
          type="button"
          onClick={() => onDelete(session.id)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors ml-auto"
          title="Delete session"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

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
