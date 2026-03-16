import { Subject, type Observable } from 'rxjs';

import type { RecordingService } from './recording.service';
import type {
  PlaybackOptions,
  PlaybackState,
  RecordedMessage,
} from './recording.types';

import { createLogger } from '@/lib/logger';

const log = createLogger('PlaybackService');

// ---------------------------------------------------------------------------
// PlaybackService
// ---------------------------------------------------------------------------

export class PlaybackService {
  private state: PlaybackState = 'idle';
  private currentSessionId: string | null = null;
  private playbackTimer: ReturnType<typeof setTimeout> | null = null;
  private messageIndex = 0;
  private messages: RecordedMessage[] = [];
  private readonly message$ = new Subject<RecordedMessage>();

  /** Wall-clock time when the current play segment started (ms). */
  private segmentStartWall = 0;
  /** Message timestamp (ms) when the current play segment started. */
  private segmentStartMsg = 0;

  private speed = 1.0;

  private readonly recordingService: RecordingService;

  constructor(recordingService: RecordingService) {
    this.recordingService = recordingService;
  }

  // -------------------------------------------------------------------------
  // Public observable
  // -------------------------------------------------------------------------

  /** Components subscribe to this to receive replayed messages. */
  getMessageStream(): Observable<RecordedMessage> {
    return this.message$.asObservable();
  }

  // -------------------------------------------------------------------------
  // startPlayback
  // -------------------------------------------------------------------------

  async startPlayback(
    sessionId: string,
    options: PlaybackOptions = { speed: 1.0 }
  ): Promise<void> {
    this.stopPlayback();

    this.currentSessionId = sessionId;
    this.speed = options.speed > 0 ? options.speed : 1.0;
    this.messages = await this.recordingService.getSessionMessages(sessionId);
    // Sort ascending by relative timestamp.
    this.messages.sort((a, b) => a.timestamp - b.timestamp);
    this.messageIndex = 0;

    if (this.messages.length === 0) {
      log.debug('No messages in session — playback complete immediately.');
      return;
    }

    this.state = 'playing';
    this.segmentStartWall = Date.now();
    this.segmentStartMsg = this.messages[0]?.timestamp ?? 0;

    log.debug(
      `Playback started — session ${sessionId}, ${this.messages.length} messages at ${this.speed}x`
    );

    this._scheduleNext();
  }

  // -------------------------------------------------------------------------
  // pausePlayback / resumePlayback
  // -------------------------------------------------------------------------

  pausePlayback(): void {
    if (this.state !== 'playing') return;
    this._clearTimer();
    this.state = 'paused';
    log.debug('Playback paused');
  }

  resumePlayback(): void {
    if (this.state !== 'paused') return;

    this.state = 'playing';

    // Re-anchor the segment start so timing is correct from the current index.
    const currentMsg = this.messages[this.messageIndex];
    if (currentMsg) {
      this.segmentStartWall = Date.now();
      this.segmentStartMsg = currentMsg.timestamp;
    }

    log.debug('Playback resumed');
    this._scheduleNext();
  }

  // -------------------------------------------------------------------------
  // stopPlayback
  // -------------------------------------------------------------------------

  stopPlayback(): void {
    this._clearTimer();
    this.state = 'idle';
    this.messages = [];
    this.messageIndex = 0;
    this.currentSessionId = null;
    log.debug('Playback stopped');
  }

  // -------------------------------------------------------------------------
  // seekTo
  // -------------------------------------------------------------------------

  seekTo(timestampMs: number): void {
    this._clearTimer();

    // Find the first message at or after the requested timestamp.
    const idx = this.messages.findIndex((m) => m.timestamp >= timestampMs);
    this.messageIndex = idx === -1 ? this.messages.length : idx;

    if (this.state === 'playing') {
      const currentMsg = this.messages[this.messageIndex];
      if (currentMsg) {
        this.segmentStartWall = Date.now();
        this.segmentStartMsg = currentMsg.timestamp;
      }
      this._scheduleNext();
    }
  }

  // -------------------------------------------------------------------------
  // setSpeed
  // -------------------------------------------------------------------------

  setSpeed(speed: number): void {
    const wasPlaying = this.state === 'playing';
    if (wasPlaying) {
      this._clearTimer();
    }

    this.speed = speed > 0 ? speed : 1.0;

    if (wasPlaying) {
      const currentMsg = this.messages[this.messageIndex];
      if (currentMsg) {
        this.segmentStartWall = Date.now();
        this.segmentStartMsg = currentMsg.timestamp;
      }
      this._scheduleNext();
    }
  }

  // -------------------------------------------------------------------------
  // getState / getProgress
  // -------------------------------------------------------------------------

  getState(): PlaybackState {
    return this.state;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    const total = this.messages.length;
    const current = Math.min(this.messageIndex, total);
    const percentage = total > 0 ? (current / total) * 100 : 0;
    return { current, total, percentage };
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  // -------------------------------------------------------------------------
  // Private scheduling
  // -------------------------------------------------------------------------

  private _scheduleNext(): void {
    if (this.state !== 'playing') return;
    if (this.messageIndex >= this.messages.length) {
      this.state = 'idle';
      log.debug('Playback complete');
      return;
    }

    const msg = this.messages[this.messageIndex];
    if (!msg) {
      this.state = 'idle';
      return;
    }

    // Time (in real ms) until this message should be emitted.
    const msgElapsed = msg.timestamp - this.segmentStartMsg;
    const realElapsed = (Date.now() - this.segmentStartWall) * this.speed;
    const delay = Math.max(0, msgElapsed - realElapsed) / this.speed;

    this.playbackTimer = setTimeout(() => {
      if (this.state !== 'playing') return;

      this.message$.next(msg);
      this.messageIndex += 1;
      this._scheduleNext();
    }, delay);
  }

  private _clearTimer(): void {
    if (this.playbackTimer !== null) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
  }
}
