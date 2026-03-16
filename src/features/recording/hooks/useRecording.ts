import { useCallback, useEffect, useRef, useState } from 'react';

import { RecordingService } from '../recording.service';
import type { RecordingSession, RecordingState } from '../recording.types';

import type { UseRecordingReturn } from './useRecording.types';

import { useRosConnection } from '@/features/telemetry/shared/useRosConnection';

// ---------------------------------------------------------------------------
// Module-level singleton — one service instance shared across all hook calls.
// ---------------------------------------------------------------------------

const recordingService = new RecordingService();
let serviceInitialized = false;
let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (serviceInitialized) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = recordingService.initialize().then(() => {
    serviceInitialized = true;
  });
  return initPromise;
}

// ---------------------------------------------------------------------------
// useRecording
// ---------------------------------------------------------------------------

export function useRecording(robotId: string | undefined): UseRecordingReturn {
  const { ros } = useRosConnection(robotId);

  const [state, setState] = useState<RecordingState>(() =>
    recordingService.getState()
  );
  const [currentSession, setCurrentSession] = useState<RecordingSession | null>(
    null
  );
  const [sessions, setSessions] = useState<RecordingSession[]>([]);

  // Track available topic types from the ROS store so we can pass TopicConfig
  // objects to the recording service. We store a ref to avoid stale closures.
  const rosRef = useRef(ros);
  useEffect(() => {
    rosRef.current = ros;
  }, [ros]);

  // -------------------------------------------------------------------------
  // Initialize service + load sessions
  // -------------------------------------------------------------------------

  const refreshSessions = useCallback(() => {
    void ensureInitialized().then(() =>
      recordingService.getSessions().then((s) => {
        // Newest first.
        setSessions(s.sort((a, b) => b.startedAt - a.startedAt));
      })
    );
  }, []);

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // -------------------------------------------------------------------------
  // startRecording
  // -------------------------------------------------------------------------

  const startRecording = useCallback(
    (topicNames: string[]) => {
      if (!robotId || rosRef.current === null) return;

      void ensureInitialized().then(() => {
        const ros = rosRef.current;
        if (!ros) return;

        // We do not know the messageType at this layer; use empty string as a
        // safe default — the recording service stores whatever roslib delivers.
        const topicConfigs = topicNames.map((name) => ({
          name,
          messageType: '',
        }));

        try {
          const session = recordingService.startRecording(
            robotId,
            topicConfigs,
            ros
          );
          setCurrentSession(session);
          setState('recording');
        } catch (err) {
          console.error('[useRecording] startRecording failed:', err);
        }
      });
    },
    [robotId]
  );

  // -------------------------------------------------------------------------
  // stopRecording
  // -------------------------------------------------------------------------

  const stopRecording = useCallback(() => {
    void recordingService
      .stopRecording()
      .then((finalSession) => {
        setCurrentSession(null);
        setState('idle');
        setSessions((prev) => [finalSession, ...prev]);
      })
      .catch((err: unknown) => {
        console.error('[useRecording] stopRecording failed:', err);
      });
  }, []);

  // -------------------------------------------------------------------------
  // deleteSession
  // -------------------------------------------------------------------------

  const deleteSession = useCallback((id: string) => {
    void recordingService
      .deleteSession(id)
      .then(() => {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      })
      .catch((err: unknown) => {
        console.error('[useRecording] deleteSession failed:', err);
      });
  }, []);

  return {
    state,
    currentSession,
    sessions,
    startRecording,
    stopRecording,
    deleteSession,
    refreshSessions,
  };
}
