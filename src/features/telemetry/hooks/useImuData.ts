import { useEffect, useRef, useState } from 'react';

import type { ImuMessage } from '../types/ros-sensor-messages.types';
import { createRosTopic } from '../utils/createRosTopic';
import {
  quaternionToEuler,
  type EulerAngles,
} from '../utils/quaternionToEuler';
import { RingBuffer } from '../utils/RingBuffer';

import type { ImuHistoryPoint, UseImuDataResult } from './useImuData.types';

import { rosServiceRegistry } from '@/services/ros/registry/RosServiceRegistry';

const HISTORY_CAPACITY = 200;

export function useImuData(
  robotId: string,
  topicName: string,
  throttleMs: number
): UseImuDataResult {
  const [imuData, setImuData] = useState<ImuMessage | null>(null);
  const [euler, setEuler] = useState<EulerAngles | null>(null);
  const [history, setHistory] = useState<ImuHistoryPoint[]>([]);

  const ringBuffer = useRef(new RingBuffer<ImuHistoryPoint>(HISTORY_CAPACITY));
  const lastEmitTime = useRef(0);

  useEffect(() => {
    const transport = rosServiceRegistry.get(robotId);
    if (!transport) return;

    const ros = transport.getRos();
    const topic = createRosTopic(ros, topicName, 'sensor_msgs/Imu');

    topic.subscribe((message: unknown) => {
      const now = Date.now();
      if (throttleMs > 0 && now - lastEmitTime.current < throttleMs) return;
      lastEmitTime.current = now;

      const msg = message as ImuMessage;
      const eulerAngles = quaternionToEuler(msg.orientation);

      setImuData(msg);
      setEuler(eulerAngles);

      const historyPoint: ImuHistoryPoint = {
        timestamp: now,
        roll: eulerAngles.roll,
        pitch: eulerAngles.pitch,
        yaw: eulerAngles.yaw,
      };

      ringBuffer.current.push(historyPoint);
      setHistory(ringBuffer.current.toArray());
    });

    return () => {
      topic.unsubscribe();
    };
  }, [robotId, topicName, throttleMs]);

  return { imuData, euler, history };
}
