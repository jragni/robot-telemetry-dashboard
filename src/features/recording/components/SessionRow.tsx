import { Download, Play, Trash2 } from 'lucide-react';

import type { SessionRowProps } from './SessionList.types';

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

export function SessionRow({
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
