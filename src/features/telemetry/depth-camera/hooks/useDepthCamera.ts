import { useMemo } from 'react';
import { EMPTY } from 'rxjs';

import { DEPTH_DEFAULT_TOPIC, DEPTH_MESSAGE_TYPE } from '../depth-camera.types';

import { useRosConnection } from '@/features/telemetry/shared';
import { useObservable } from '@/hooks/useObservable';
import { createTopicSubscription } from '@/services/ros';
import type { CompressedImageMessage } from '@/types/ros-messages';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseDepthCameraResult {
  frame: CompressedImageMessage | null;
  connectionState: ReturnType<typeof useRosConnection>['connectionState'];
  topic: string;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Subscribes to a compressed depth-camera image topic and exposes the latest
 * frame.  When not connected the frame is null.
 */
export function useDepthCamera(
  robotId: string | undefined,
  topic = DEPTH_DEFAULT_TOPIC
): UseDepthCameraResult {
  const { ros, connectionState } = useRosConnection(robotId);

  const frame$ = useMemo(() => {
    if (!ros)
      return EMPTY as unknown as ReturnType<
        typeof createTopicSubscription<CompressedImageMessage>
      >;
    return createTopicSubscription<CompressedImageMessage>(
      ros,
      topic,
      DEPTH_MESSAGE_TYPE
    );
  }, [ros, topic]);

  const frame = useObservable<CompressedImageMessage | null>(frame$, null);

  return { frame, connectionState, topic };
}
