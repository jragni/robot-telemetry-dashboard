import type ROSLIB from 'roslib';
import type { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import type {
  RecordedMessage,
  RecordingSession,
  RecordingState,
  TopicConfig,
} from './recording.types';

import { createLogger } from '@/lib/logger';
import { createTopicSubscription } from '@/services/ros/subscriber/TopicSubscriber';

const log = createLogger('RecordingService');

// ---------------------------------------------------------------------------
// IndexedDB constants
// ---------------------------------------------------------------------------

const DB_NAME = 'rtd-recordings';
const DB_VERSION = 1;
const STORE_SESSIONS = 'sessions';
const STORE_MESSAGES = 'messages';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function roughSizeOf(value: unknown): number {
  try {
    return JSON.stringify(value)?.length ?? 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// RecordingService
// ---------------------------------------------------------------------------

export class RecordingService {
  private state: RecordingState = 'idle';
  private currentSession: RecordingSession | null = null;
  private subscriptions = new Map<string, Subscription>();
  private db: IDBDatabase | null = null;

  /** Running count of messages for the active session (in-memory fast path). */
  private messageCount = 0;
  /** Running byte estimate for the active session. */
  private sizeBytes = 0;

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  async initialize(): Promise<void> {
    if (this.db !== null) return;

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
          db.createObjectStore(STORE_SESSIONS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
          const msgStore = db.createObjectStore(STORE_MESSAGES, {
            autoIncrement: true,
          });
          msgStore.createIndex('sessionId', 'sessionId', { unique: false });
          msgStore.createIndex('topicName', 'topicName', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        log.debug('IndexedDB opened successfully');
        resolve();
      };

      request.onerror = () => {
        reject(
          new Error(
            `[RecordingService] Failed to open IndexedDB: ${request.error?.message ?? 'unknown'}`
          )
        );
      };
    });
  }

  // -------------------------------------------------------------------------
  // getState
  // -------------------------------------------------------------------------

  getState(): RecordingState {
    return this.state;
  }

  // -------------------------------------------------------------------------
  // startRecording
  // -------------------------------------------------------------------------

  startRecording(
    robotId: string,
    topics: TopicConfig[],
    ros: ROSLIB.Ros
  ): RecordingSession {
    if (this.state === 'recording') {
      throw new Error(
        '[RecordingService] Already recording. Call stopRecording() first.'
      );
    }

    const session: RecordingSession = {
      id: generateId(),
      name: `Recording ${new Date().toLocaleString()}`,
      robotId,
      topics: topics.map((t) => t.name),
      startedAt: Date.now(),
      endedAt: null,
      messageCount: 0,
      sizeBytes: 0,
    };

    this.currentSession = session;
    this.messageCount = 0;
    this.sizeBytes = 0;
    this.state = 'recording';

    this._persistSession(session);

    const sessionStartMs = session.startedAt;

    for (const topic of topics) {
      const obs$ = createTopicSubscription(ros, topic.name, topic.messageType);

      const sub = obs$
        .pipe(
          tap((data) => {
            const msg: RecordedMessage = {
              sessionId: session.id,
              topicName: topic.name,
              messageType: topic.messageType,
              timestamp: Date.now() - sessionStartMs,
              data,
            };

            this.messageCount += 1;
            this.sizeBytes += roughSizeOf(data);
            this._persistMessage(msg);
          })
        )
        .subscribe({
          error: (err: unknown) =>
            log.error(`Topic subscription error on ${topic.name}:`, err),
        });

      this.subscriptions.set(topic.name, sub);
    }

    log.debug(
      `Recording started — session ${session.id}, topics: ${topics.map((t) => t.name).join(', ')}`
    );

    return session;
  }

  // -------------------------------------------------------------------------
  // stopRecording
  // -------------------------------------------------------------------------

  async stopRecording(): Promise<RecordingSession> {
    if (this.state !== 'recording' || this.currentSession === null) {
      throw new Error('[RecordingService] Not currently recording.');
    }

    // Unsubscribe all topic streams first so no more messages arrive.
    for (const [topicName, sub] of this.subscriptions) {
      sub.unsubscribe();
      log.debug(`Unsubscribed from ${topicName}`);
    }
    this.subscriptions.clear();

    const endedAt = Date.now();
    const finalSession: RecordingSession = {
      ...this.currentSession,
      endedAt,
      messageCount: this.messageCount,
      sizeBytes: this.sizeBytes,
    };

    this.currentSession = null;
    this.state = 'idle';

    await this._updateSession(finalSession);

    log.debug(
      `Recording stopped — session ${finalSession.id}, ${finalSession.messageCount} messages`
    );

    return finalSession;
  }

  // -------------------------------------------------------------------------
  // getSessions
  // -------------------------------------------------------------------------

  async getSessions(): Promise<RecordingSession[]> {
    const db = this._requireDb();
    return new Promise<RecordingSession[]>((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readonly');
      const store = tx.objectStore(STORE_SESSIONS);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result as RecordingSession[]);
      req.onerror = () =>
        reject(
          new Error(
            `[RecordingService] getSessions failed: ${req.error?.message ?? 'unknown'}`
          )
        );
    });
  }

  // -------------------------------------------------------------------------
  // getSessionMessages
  // -------------------------------------------------------------------------

  async getSessionMessages(sessionId: string): Promise<RecordedMessage[]> {
    const db = this._requireDb();
    return new Promise<RecordedMessage[]>((resolve, reject) => {
      const tx = db.transaction(STORE_MESSAGES, 'readonly');
      const store = tx.objectStore(STORE_MESSAGES);
      const index = store.index('sessionId');
      const req = index.getAll(sessionId);

      req.onsuccess = () => resolve(req.result as RecordedMessage[]);
      req.onerror = () =>
        reject(
          new Error(
            `[RecordingService] getSessionMessages failed: ${req.error?.message ?? 'unknown'}`
          )
        );
    });
  }

  // -------------------------------------------------------------------------
  // deleteSession
  // -------------------------------------------------------------------------

  async deleteSession(sessionId: string): Promise<void> {
    const db = this._requireDb();

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_SESSIONS, STORE_MESSAGES], 'readwrite');

      tx.onerror = () =>
        reject(
          new Error(
            `[RecordingService] deleteSession failed: ${tx.error?.message ?? 'unknown'}`
          )
        );

      tx.oncomplete = () => resolve();

      // Delete the session record.
      tx.objectStore(STORE_SESSIONS).delete(sessionId);

      // Delete all messages for this session via the index cursor.
      const index = tx.objectStore(STORE_MESSAGES).index('sessionId');
      const cursorReq = index.openCursor(IDBKeyRange.only(sessionId));

      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    });
  }

  // -------------------------------------------------------------------------
  // Private — IndexedDB write helpers
  // -------------------------------------------------------------------------

  private _requireDb(): IDBDatabase {
    if (this.db === null) {
      throw new Error(
        '[RecordingService] Database not initialized. Call initialize() first.'
      );
    }
    return this.db;
  }

  private _persistSession(session: RecordingSession): void {
    if (this.db === null) return;

    const tx = this.db.transaction(STORE_SESSIONS, 'readwrite');
    tx.objectStore(STORE_SESSIONS).put(session);
    tx.onerror = () =>
      log.error('Failed to persist session:', tx.error?.message);
  }

  private _updateSession(session: RecordingSession): Promise<void> {
    const db = this._requireDb();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_SESSIONS, 'readwrite');
      const req = tx.objectStore(STORE_SESSIONS).put(session);

      req.onsuccess = () => resolve();
      req.onerror = () =>
        reject(
          new Error(
            `[RecordingService] _updateSession failed: ${req.error?.message ?? 'unknown'}`
          )
        );
    });
  }

  private _persistMessage(msg: RecordedMessage): void {
    if (this.db === null) return;

    const tx = this.db.transaction(STORE_MESSAGES, 'readwrite');
    tx.objectStore(STORE_MESSAGES).add(msg);
    tx.onerror = () =>
      log.error('Failed to persist message:', tx.error?.message);
  }
}
