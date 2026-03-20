import { useEffect, useRef, useState } from 'react';

import type { LaserScanMessage } from '../types/ros-sensor-messages.types';
import { createRosTopic } from '../utils/createRosTopic';
import { polarToCartesian } from '../utils/polarToCartesian';

import type { UseLidarScanResult } from './useLidarScan.types';

import { rosServiceRegistry } from '@/services/ros/registry/RosServiceRegistry';

const DEFAULT_MAX_RANGE = 10;

export function useLidarScan(
  robotId: string,
  topicName: string,
  maxRange = DEFAULT_MAX_RANGE
): UseLidarScanResult {
  const [scanPoints, setScanPoints] = useState<Float32Array>(
    new Float32Array(0)
  );
  const [hasData, setHasData] = useState(false);

  const lastEmitTime = useRef(0);
  const THROTTLE_MS = 100;

  useEffect(() => {
    const transport = rosServiceRegistry.get(robotId);
    if (!transport) return;

    const ros = transport.getRos();
    const topic = createRosTopic(ros, topicName, 'sensor_msgs/LaserScan');

    topic.subscribe((message: unknown) => {
      const now = Date.now();
      if (now - lastEmitTime.current < THROTTLE_MS) return;
      lastEmitTime.current = now;

      const scan = message as LaserScanMessage;
      const points = polarToCartesian(scan, maxRange);
      setScanPoints(points);
      setHasData(points.length > 0);
    });

    return () => {
      topic.unsubscribe();
    };
  }, [robotId, topicName, maxRange]);

  return { scanPoints, hasData };
}
