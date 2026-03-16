import { useState, useEffect, useMemo, useRef } from 'react';

import type { PlotSample, PlotStrategy } from '../data-plot.types';
import {
  detectPlotStrategy,
  extractNumericPaths,
  extractSample,
} from '../data-plot.utils';

import { useRosConnection } from '@/features/telemetry/shared/useRosConnection';
import { createTopicSubscription } from '@/services/ros/subscriber/TopicSubscriber';
import type { TopicInfo } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of samples to keep in memory */
const MAX_SAMPLES = 300;

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseDataPlotResult {
  samples: PlotSample[];
  strategy: PlotStrategy;
  selectedTopic: TopicInfo | null;
  connectionState: ReturnType<typeof useRosConnection>['connectionState'];
  setSelectedTopic: (topic: TopicInfo | null) => void;
  clearSamples: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDataPlot(
  robotId: string | undefined,
  initialTopic?: TopicInfo
): UseDataPlotResult {
  const { ros, connectionState } = useRosConnection(robotId);

  const [selectedTopic, setSelectedTopic] = useState<TopicInfo | null>(
    initialTopic ?? null
  );
  const [samples, setSamples] = useState<PlotSample[]>([]);
  const sampleCountRef = useRef(0);

  const strategy = useMemo<PlotStrategy>(() => {
    if (!selectedTopic) return detectPlotStrategy('');
    return detectPlotStrategy(selectedTopic.messageType);
  }, [selectedTopic]);

  // Subscribe to selected topic and collect samples
  useEffect(() => {
    if (!ros || !selectedTopic) return;

    setSamples([]);
    sampleCountRef.current = 0;

    const observable$ = createTopicSubscription<unknown>(
      ros,
      selectedTopic.name,
      selectedTopic.messageType
    );

    const effectivePaths =
      strategy.id === 'numeric-flat'
        ? extractNumericPaths(null) // start empty; paths detected on first message
        : strategy.paths;

    let dynamicPaths = effectivePaths;

    const sub = observable$.subscribe((msg) => {
      // For numeric-flat, derive paths from the first message
      if (strategy.id === 'numeric-flat' && sampleCountRef.current === 0) {
        dynamicPaths = extractNumericPaths(msg);
      }

      const sample = extractSample(msg, dynamicPaths, Date.now());
      sampleCountRef.current += 1;

      setSamples((prev) => {
        const next = [...prev, sample];
        return next.length > MAX_SAMPLES
          ? next.slice(next.length - MAX_SAMPLES)
          : next;
      });
    });

    return () => sub.unsubscribe();
  }, [ros, selectedTopic, strategy]);

  // Clear samples when disconnected
  useEffect(() => {
    if (connectionState !== 'connected') {
      setSamples([]);
    }
  }, [connectionState]);

  const clearSamples = () => {
    setSamples([]);
    sampleCountRef.current = 0;
  };

  return {
    samples,
    strategy,
    selectedTopic,
    connectionState,
    setSelectedTopic,
    clearSamples,
  };
}
