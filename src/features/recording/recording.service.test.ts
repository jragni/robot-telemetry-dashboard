import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// jsdom does not include IDBKeyRange — provide it from fake-indexeddb.
globalThis.IDBKeyRange = IDBKeyRange;

import { RecordingService } from './recording.service';
import type { TopicConfig } from './recording.types';

// ---------------------------------------------------------------------------
// Mock createTopicSubscription
// ---------------------------------------------------------------------------

// Subject map keyed by topic name — allows tests to emit messages manually.
const subjectMap = new Map<string, Subject<unknown>>();

vi.mock('@/services/ros/TopicSubscriber', () => ({
  createTopicSubscription: (
    _ros: unknown,
    topicName: string,
    _messageType: string
  ) => {
    const subject = new Subject<unknown>();
    subjectMap.set(topicName, subject);
    return subject.asObservable();
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A minimal fake ROSLIB.Ros instance — only the reference identity matters. */
const fakeRos = {} as import('roslib').Ros;

const TOPICS: TopicConfig[] = [
  { name: '/imu/data', messageType: 'sensor_msgs/Imu' },
  { name: '/scan', messageType: 'sensor_msgs/LaserScan' },
];

function emitOn(topicName: string, data: unknown): void {
  const subject = subjectMap.get(topicName);
  if (!subject) throw new Error(`No subject for topic ${topicName}`);
  subject.next(data);
}

/** Flush microtask queue to let IndexedDB callbacks settle. */
function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RecordingService', () => {
  let service: RecordingService;

  beforeEach(() => {
    subjectMap.clear();
    // Give each test a fresh IndexedDB so sessions do not bleed across tests.
    globalThis.indexedDB = new IDBFactory();
    service = new RecordingService();
  });

  // -------------------------------------------------------------------------
  // initialize
  // -------------------------------------------------------------------------

  describe('initialize()', () => {
    it('opens the database without error', async () => {
      await expect(service.initialize()).resolves.toBeUndefined();
    });

    it('is idempotent — calling twice does not throw', async () => {
      await service.initialize();
      await expect(service.initialize()).resolves.toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // getState
  // -------------------------------------------------------------------------

  describe('getState()', () => {
    it('starts as idle', () => {
      expect(service.getState()).toBe('idle');
    });

    it('is "recording" after startRecording', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);
      expect(service.getState()).toBe('recording');
    });

    it('is "idle" after stopRecording', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);
      await service.stopRecording();
      expect(service.getState()).toBe('idle');
    });
  });

  // -------------------------------------------------------------------------
  // startRecording
  // -------------------------------------------------------------------------

  describe('startRecording()', () => {
    it('returns a session with correct robotId', async () => {
      await service.initialize();
      const session = service.startRecording('robot-42', TOPICS, fakeRos);
      expect(session.robotId).toBe('robot-42');
    });

    it('returns a session with matching topics array', async () => {
      await service.initialize();
      const session = service.startRecording('robot-1', TOPICS, fakeRos);
      expect(session.topics).toEqual(['/imu/data', '/scan']);
    });

    it('generates a non-empty session id', async () => {
      await service.initialize();
      const session = service.startRecording('robot-1', TOPICS, fakeRos);
      expect(session.id.length).toBeGreaterThan(0);
    });

    it('sets startedAt as a recent timestamp', async () => {
      const before = Date.now();
      await service.initialize();
      const session = service.startRecording('robot-1', TOPICS, fakeRos);
      const after = Date.now();
      expect(session.startedAt).toBeGreaterThanOrEqual(before);
      expect(session.startedAt).toBeLessThanOrEqual(after);
    });

    it('sets endedAt to null initially', async () => {
      await service.initialize();
      const session = service.startRecording('robot-1', TOPICS, fakeRos);
      expect(session.endedAt).toBeNull();
    });

    it('starts with messageCount of 0', async () => {
      await service.initialize();
      const session = service.startRecording('robot-1', TOPICS, fakeRos);
      expect(session.messageCount).toBe(0);
    });

    it('throws if called while already recording', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);
      expect(() =>
        service.startRecording('robot-1', TOPICS, fakeRos)
      ).toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Message capture
  // -------------------------------------------------------------------------

  describe('message capture', () => {
    it('stores messages when an observable emits', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);

      const payload = { x: 1, y: 2, z: 3 };
      emitOn('/imu/data', payload);
      await flushPromises();

      const session = await service.stopRecording();
      const messages = await service.getSessionMessages(session.id);

      expect(messages.length).toBe(1);
      expect(messages[0]?.topicName).toBe('/imu/data');
      expect(messages[0]?.data).toEqual(payload);
    });

    it('records messages from multiple topics', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);

      emitOn('/imu/data', { a: 1 });
      emitOn('/scan', { b: 2 });
      emitOn('/imu/data', { a: 3 });
      await flushPromises();

      const session = await service.stopRecording();
      const messages = await service.getSessionMessages(session.id);

      expect(messages.length).toBe(3);
    });

    it('assigns a relative timestamp (ms) to each message', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);

      emitOn('/imu/data', {});
      await flushPromises();

      const session = await service.stopRecording();
      const messages = await service.getSessionMessages(session.id);

      expect(messages[0]?.timestamp).toBeGreaterThanOrEqual(0);
    });

    it('assigns the correct messageType', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);

      emitOn('/scan', {});
      await flushPromises();

      const session = await service.stopRecording();
      const messages = await service.getSessionMessages(session.id);

      const scanMessages = messages.filter((m) => m.topicName === '/scan');
      expect(scanMessages[0]?.messageType).toBe('sensor_msgs/LaserScan');
    });
  });

  // -------------------------------------------------------------------------
  // stopRecording
  // -------------------------------------------------------------------------

  describe('stopRecording()', () => {
    it('sets endedAt on the session', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);
      const session = await service.stopRecording();
      expect(session.endedAt).not.toBeNull();
      expect(typeof session.endedAt).toBe('number');
    });

    it('unsubscribes all topics — no more messages stored after stop', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);

      emitOn('/imu/data', { before: true });
      await flushPromises();

      const session = await service.stopRecording();

      // Emit after stop — should not be stored
      emitOn('/imu/data', { after: true });
      await flushPromises();

      const messages = await service.getSessionMessages(session.id);
      expect(messages.length).toBe(1);
      expect((messages[0]?.data as Record<string, unknown>).before).toBe(true);
    });

    it('rejects if called when not recording', async () => {
      await service.initialize();
      await expect(service.stopRecording()).rejects.toThrow();
    });

    it('updates messageCount on the persisted session', async () => {
      await service.initialize();
      service.startRecording('robot-1', TOPICS, fakeRos);

      emitOn('/imu/data', {});
      emitOn('/scan', {});
      await flushPromises();

      await service.stopRecording();
      await flushPromises();

      const sessions = await service.getSessions();
      expect(sessions[0]?.messageCount).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // getSessions
  // -------------------------------------------------------------------------

  describe('getSessions()', () => {
    it('returns an empty array when there are no sessions', async () => {
      await service.initialize();
      const sessions = await service.getSessions();
      expect(sessions).toEqual([]);
    });

    it('returns all stored sessions', async () => {
      await service.initialize();

      service.startRecording('robot-1', TOPICS, fakeRos);
      await service.stopRecording();

      service.startRecording('robot-2', TOPICS, fakeRos);
      await service.stopRecording();

      const sessions = await service.getSessions();
      expect(sessions.length).toBe(2);
    });
  });

  // -------------------------------------------------------------------------
  // getSessionMessages
  // -------------------------------------------------------------------------

  describe('getSessionMessages()', () => {
    it('returns messages only for the requested session', async () => {
      await service.initialize();

      service.startRecording('robot-1', TOPICS, fakeRos);
      emitOn('/imu/data', { session: 1 });
      await flushPromises();
      const sessionA = await service.stopRecording();

      service.startRecording('robot-1', TOPICS, fakeRos);
      emitOn('/scan', { session: 2 });
      await flushPromises();
      const sessionB = await service.stopRecording();

      const messagesA = await service.getSessionMessages(sessionA.id);
      const messagesB = await service.getSessionMessages(sessionB.id);

      expect(messagesA.length).toBe(1);
      expect(messagesB.length).toBe(1);
      expect(messagesA[0]?.sessionId).toBe(sessionA.id);
      expect(messagesB[0]?.sessionId).toBe(sessionB.id);
    });

    it('returns an empty array for an unknown session id', async () => {
      await service.initialize();
      const messages = await service.getSessionMessages('nonexistent-id');
      expect(messages).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // deleteSession
  // -------------------------------------------------------------------------

  describe('deleteSession()', () => {
    it('removes the session from the sessions list', async () => {
      await service.initialize();

      service.startRecording('robot-1', TOPICS, fakeRos);
      emitOn('/imu/data', {});
      await flushPromises();
      const session = await service.stopRecording();

      await service.deleteSession(session.id);

      const sessions = await service.getSessions();
      expect(sessions.find((s) => s.id === session.id)).toBeUndefined();
    });

    it('removes associated messages when session is deleted', async () => {
      await service.initialize();

      service.startRecording('robot-1', TOPICS, fakeRos);
      emitOn('/imu/data', {});
      emitOn('/scan', {});
      await flushPromises();
      const session = await service.stopRecording();

      await service.deleteSession(session.id);

      const messages = await service.getSessionMessages(session.id);
      expect(messages).toEqual([]);
    });

    it('does not affect other sessions when deleting one', async () => {
      await service.initialize();

      service.startRecording('robot-1', TOPICS, fakeRos);
      emitOn('/imu/data', {});
      await flushPromises();
      const sessionA = await service.stopRecording();

      service.startRecording('robot-1', TOPICS, fakeRos);
      emitOn('/scan', {});
      await flushPromises();
      const sessionB = await service.stopRecording();

      await service.deleteSession(sessionA.id);

      const sessions = await service.getSessions();
      expect(sessions.length).toBe(1);
      expect(sessions[0]?.id).toBe(sessionB.id);

      const messagesB = await service.getSessionMessages(sessionB.id);
      expect(messagesB.length).toBe(1);
    });
  });
});
