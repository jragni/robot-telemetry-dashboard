// ---------------------------------------------------------------------------
// Session metadata
// ---------------------------------------------------------------------------

export interface RecordingSession {
  id: string;
  name: string;
  robotId: string;
  topics: string[];
  startedAt: number;
  endedAt: number | null;
  messageCount: number;
  sizeBytes: number;
}

// ---------------------------------------------------------------------------
// Stored message
// ---------------------------------------------------------------------------

export interface RecordedMessage {
  sessionId: string;
  topicName: string;
  messageType: string;
  /** Milliseconds elapsed since session start (relative timestamp). */
  timestamp: number;
  data: unknown;
}

// ---------------------------------------------------------------------------
// State types
// ---------------------------------------------------------------------------

export type RecordingState = 'idle' | 'recording' | 'paused';

export type PlaybackState = 'idle' | 'playing' | 'paused';

// ---------------------------------------------------------------------------
// Playback options
// ---------------------------------------------------------------------------

export interface PlaybackOptions {
  /** 1.0 = real-time, 2.0 = double speed, 0.5 = half speed */
  speed: number;
}

// ---------------------------------------------------------------------------
// Topic config used by the recording service
// ---------------------------------------------------------------------------

export interface TopicConfig {
  name: string;
  messageType: string;
}
