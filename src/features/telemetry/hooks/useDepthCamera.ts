import { useEffect, useRef, useState } from 'react';

import type { CompressedImageMessage } from '../types/ros-sensor-messages.types';
import { applyColormap } from '../utils/applyColormap';
import { createRosTopic } from '../utils/createRosTopic';

import type {
  UseDepthCameraOptions,
  UseDepthCameraResult,
} from './useDepthCamera.types';

import { rosServiceRegistry } from '@/services/ros/registry/RosServiceRegistry';

export function useDepthCamera({
  robotId,
  topicName,
  canvasRef,
  colormap = 'grayscale',
}: UseDepthCameraOptions): UseDepthCameraResult {
  const [hasFrame, setHasFrame] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState<number | null>(null);

  const frameTimestamps = useRef<number[]>([]);

  useEffect(() => {
    const transport = rosServiceRegistry.get(robotId);
    if (!transport) return;

    const ros = transport.getRos();
    const topic = createRosTopic(ros, topicName, 'sensor_msgs/CompressedImage');

    topic.subscribe((message: unknown) => {
      const msg = message as CompressedImageMessage;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Validate format
      const format = msg.format?.toLowerCase() ?? '';
      const supported = ['jpeg', 'jpg', 'png', '16uc1', 'mono16', '32fc1'].some(
        (f) => format.includes(f)
      );
      if (!supported && format !== '') {
        setError(`Unsupported format: ${msg.format}`);
        return;
      }

      try {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          if (colormap !== 'none' && colormap !== 'grayscale') {
            applyColormap(ctx, colormap);
          }
          setHasFrame(true);
          setError(null);

          // FPS tracking (rolling 10-frame window)
          const now = performance.now();
          frameTimestamps.current.push(now);
          if (frameTimestamps.current.length > 10) {
            frameTimestamps.current.shift();
          }
          if (frameTimestamps.current.length >= 2) {
            const span = now - frameTimestamps.current[0];
            const measuredFps =
              ((frameTimestamps.current.length - 1) / span) * 1000;
            setFps(Math.round(measuredFps * 10) / 10);
          }
        };
        img.onerror = () => {
          setError('Corrupt image data received');
        };
        img.src = `data:image/${format.includes('png') ? 'png' : 'jpeg'};base64,${msg.data}`;
      } catch {
        setError('Corrupt image data received');
      }
    });

    return () => {
      topic.unsubscribe();
    };
  }, [robotId, topicName, colormap, canvasRef]);

  return { hasFrame, error, fps };
}
