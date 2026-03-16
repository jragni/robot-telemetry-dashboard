import type { RecordedMessage, RecordingSession } from './recording.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9_\-. ]/gi, '_').trim();
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// JSON export
// ---------------------------------------------------------------------------

/**
 * Creates a JSON file containing the session metadata and all recorded
 * messages, then triggers a browser download.
 *
 * Output shape:
 * ```json
 * {
 *   "session": { ...RecordingSession },
 *   "messages": [ ...RecordedMessage ]
 * }
 * ```
 */
export function exportSessionAsJson(
  session: RecordingSession,
  messages: RecordedMessage[]
): void {
  const payload = { session, messages };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const filename = `${sanitizeFilename(session.name)}.json`;
  triggerDownload(blob, filename);
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

/**
 * Flattens recorded messages to CSV rows and triggers a browser download.
 *
 * Columns: timestamp, topic, messageType, data
 *
 * The `data` column contains the JSON-serialised message payload.
 * Values that contain commas or quotes are wrapped in double-quotes with
 * internal quotes escaped per RFC 4180.
 */
export function exportSessionAsCsv(
  session: RecordingSession,
  messages: RecordedMessage[]
): void {
  const csvEscape = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const header = ['timestamp', 'topic', 'messageType', 'data'].join(',');

  const rows = messages.map((msg) => {
    const cols = [
      String(msg.timestamp),
      csvEscape(msg.topicName),
      csvEscape(msg.messageType),
      csvEscape(JSON.stringify(msg.data)),
    ];
    return cols.join(',');
  });

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const filename = `${sanitizeFilename(session.name)}.csv`;
  triggerDownload(blob, filename);
}
