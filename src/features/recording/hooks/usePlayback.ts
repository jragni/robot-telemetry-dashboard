import { useCallback, useEffect, useRef, useState } from 'react';

import { PlaybackService } from '../playback.service';
import { RecordingService } from '../recording.service';
import type { PlaybackState, RecordedMessage } from '../recording.types';

import type { UsePlaybackReturn } from './usePlayback.types';

// ---------------------------------------------------------------------------
// Module-level singletons
// ---------------------------------------------------------------------------

// Reuse the recording service singleton from useRecording if needed.
// We create a local one here for the playback service's dependency.
const sharedRecordingService = new RecordingService();
let recordingInitialized = false;

function ensureRecordingInitialized(): Promise<void> {
  if (recordingInitialized) return Promise.resolve();
  return sharedRecordingService.initialize().then(() => {
    recordingInitialized = true;
  });
}

const playbackService = new PlaybackService(sharedRecordingService);

// ---------------------------------------------------------------------------
// usePlayback
// ---------------------------------------------------------------------------

export function usePlayback(): UsePlaybackReturn {
  const [state, setState] = useState<PlaybackState>(() =>
    playbackService.getState()
  );
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
  }>({ current: 0, total: 0, percentage: 0 });
  const [currentMessage, setCurrentMessage] = useState<RecordedMessage | null>(
    null
  );
  const [speed, setSpeedState] = useState<number>(1.0);

  // -------------------------------------------------------------------------
  // Subscribe to the message stream
  // -------------------------------------------------------------------------

  useEffect(() => {
    const sub = playbackService.getMessageStream().subscribe((msg) => {
      setCurrentMessage(msg);
      setProgress(playbackService.getProgress());
      setState(playbackService.getState());
    });

    return () => sub.unsubscribe();
  }, []);

  // Ref to avoid stale closure in interval
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll state and progress while playing so the UI stays responsive.
  useEffect(() => {
    if (state === 'playing') {
      tickIntervalRef.current = setInterval(() => {
        setProgress(playbackService.getProgress());
        setState(playbackService.getState());
      }, 100);
    } else {
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    }

    return () => {
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [state]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const startPlayback = useCallback((sessionId: string) => {
    void ensureRecordingInitialized().then(() => {
      void playbackService.startPlayback(sessionId, { speed: 1.0 }).then(() => {
        setState(playbackService.getState());
        setProgress(playbackService.getProgress());
      });
    });
  }, []);

  const pausePlayback = useCallback(() => {
    playbackService.pausePlayback();
    setState(playbackService.getState());
  }, []);

  const resumePlayback = useCallback(() => {
    playbackService.resumePlayback();
    setState(playbackService.getState());
  }, []);

  const stopPlayback = useCallback(() => {
    playbackService.stopPlayback();
    setState('idle');
    setProgress({ current: 0, total: 0, percentage: 0 });
    setCurrentMessage(null);
  }, []);

  const setSpeed = useCallback((newSpeed: number) => {
    playbackService.setSpeed(newSpeed);
    setSpeedState(newSpeed);
  }, []);

  return {
    state,
    progress,
    currentMessage,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    setSpeed,
    speed,
  };
}
