import { useRef, useEffect, useState } from 'react';

import { type ImuDerivedData, IMU_DEFAULT_TOPIC } from '../imu.types';

import { useImuData } from './useImuData';

import type { ConnectionState } from '@/types/connection.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BUFFER_SIZE = 200;

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseImuHistoryResult {
  history: ImuDerivedData[];
  connectionState: ConnectionState;
  topicName: string;
}

// ---------------------------------------------------------------------------
// useImuHistory
// ---------------------------------------------------------------------------

/**
 * Wraps useImuData and accumulates incoming samples into a fixed-size circular
 * buffer. The most recent `bufferSize` samples are returned as an ordered
 * array (oldest first).
 *
 * @param robotId     Target robot identifier.
 * @param topicName   Override for the IMU topic name.
 * @param bufferSize  Maximum number of samples to retain (default 200).
 */
export function useImuHistory(
  robotId: string | undefined,
  topicName: string = IMU_DEFAULT_TOPIC,
  bufferSize: number = DEFAULT_BUFFER_SIZE
): UseImuHistoryResult {
  const { data, connectionState } = useImuData(robotId, topicName);

  // Circular buffer backed by a ref to avoid triggering re-renders on every
  // incoming sample. A parallel state snapshot is exposed to consumers.
  const bufferRef = useRef<ImuDerivedData[]>([]);
  const [history, setHistory] = useState<ImuDerivedData[]>([]);

  useEffect(() => {
    if (data === null) return;

    const buf = bufferRef.current;
    buf.push(data);

    // Trim to desired capacity — remove oldest entries from the front
    if (buf.length > bufferSize) {
      buf.splice(0, buf.length - bufferSize);
    }

    // Expose a shallow copy so downstream memo comparisons detect the change
    setHistory([...buf]);
  }, [data, bufferSize]);

  // Clear history when the connection drops to avoid stale plot data
  useEffect(() => {
    if (connectionState !== 'connected') {
      bufferRef.current = [];
      setHistory([]);
    }
  }, [connectionState]);

  return { history, connectionState, topicName };
}
