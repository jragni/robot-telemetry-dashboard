import type { RecordingSession, RecordingState } from '../recording.types';

export interface UseRecordingReturn {
  state: RecordingState;
  currentSession: RecordingSession | null;
  sessions: RecordingSession[];
  startRecording: (topics: string[]) => void;
  stopRecording: () => void;
  deleteSession: (id: string) => void;
  refreshSessions: () => void;
}
