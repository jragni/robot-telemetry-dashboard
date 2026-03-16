import type { PlaybackState, RecordedMessage } from '../recording.types';

export interface UsePlaybackReturn {
  state: PlaybackState;
  progress: { current: number; total: number; percentage: number };
  currentMessage: RecordedMessage | null;
  startPlayback: (sessionId: string) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
  setSpeed: (speed: number) => void;
  speed: number;
}
