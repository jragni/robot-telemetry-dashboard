import { useEffect, useRef, useState } from 'react';

import { createRosTopic } from '../utils/createRosTopic';
import { extractNumericFields } from '../utils/extractNumericFields';
import { RingBuffer } from '../utils/RingBuffer';

import type { UseDataPlotResult } from './useDataPlot.types';

import { rosServiceRegistry } from '@/services/ros/registry/RosServiceRegistry';

function getValueAtPath(obj: unknown, path: string): number | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'number' ? current : undefined;
}

const DEFAULT_CAPACITY = 500;

export function useDataPlot(
  robotId: string,
  topicName: string,
  selectedFields: string[] | undefined,
  windowSecs: number,
  throttleMs: number
): UseDataPlotResult {
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [series, setSeries] = useState<Record<string, number[]>>({});

  const capacity = Math.max(
    DEFAULT_CAPACITY,
    windowSecs > 0 && throttleMs > 0
      ? Math.ceil((windowSecs * 1000) / throttleMs)
      : DEFAULT_CAPACITY
  );

  const timestampBuffer = useRef(new RingBuffer<number>(capacity));
  const seriesBuffers = useRef<Record<string, RingBuffer<number>>>({});
  const lastEmitTime = useRef(0);
  const availableFieldsRef = useRef<string[]>([]);
  const selectedFieldsRef = useRef(selectedFields);
  selectedFieldsRef.current = selectedFields;
  const capacityRef = useRef(capacity);
  capacityRef.current = capacity;

  useEffect(() => {
    const transport = rosServiceRegistry.get(robotId);
    if (!transport) return;

    const ros = transport.getRos();
    const topic = createRosTopic(ros, topicName, 'ros_topic');

    topic.subscribe((message: unknown) => {
      const now = Date.now();
      if (throttleMs > 0 && now - lastEmitTime.current < throttleMs) return;
      lastEmitTime.current = now;

      // Auto-detect fields on first message
      if (availableFieldsRef.current.length === 0) {
        const fields = extractNumericFields(message);
        availableFieldsRef.current = fields;
        setAvailableFields(fields);
      }

      // Determine which fields to buffer
      const currentSelected = selectedFieldsRef.current;
      const fieldsToBuffer =
        currentSelected !== undefined && currentSelected.length > 0
          ? currentSelected
          : availableFieldsRef.current;

      // Initialize buffers for new fields
      for (const field of fieldsToBuffer) {
        if (!seriesBuffers.current[field]) {
          seriesBuffers.current[field] = new RingBuffer<number>(
            capacityRef.current
          );
        }
      }

      // Push values
      let hasValidValue = false;
      for (const field of fieldsToBuffer) {
        const val = getValueAtPath(message, field);
        if (val === undefined || !isFinite(val) || isNaN(val)) continue;
        seriesBuffers.current[field].push(val);
        hasValidValue = true;
      }

      if (hasValidValue) {
        timestampBuffer.current.push(now);

        const newSeries: Record<string, number[]> = {};
        for (const field of fieldsToBuffer) {
          if (seriesBuffers.current[field]) {
            newSeries[field] = seriesBuffers.current[field].toArray();
          }
        }

        setTimestamps(timestampBuffer.current.toArray());
        setSeries(newSeries);
      }
    });

    return () => {
      topic.unsubscribe();
    };
  }, [robotId, topicName, throttleMs]);

  return { availableFields, timestamps, series };
}
