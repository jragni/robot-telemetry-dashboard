import type { RecordingSession } from '../recording.types';

export interface SessionListProps {
  robotId: string | undefined;
  onPlaySession?: (sessionId: string) => void;
}

export interface SessionRowProps {
  session: RecordingSession;
  onDelete: (id: string) => void;
  onPlay?: (id: string) => void;
  onExportJson: (session: RecordingSession) => void;
  onExportCsv: (session: RecordingSession) => void;
}
