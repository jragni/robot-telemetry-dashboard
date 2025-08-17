'use client';

import { useEffect, useRef, useState } from 'react';
import { useConnection } from '@/components/dashboard/ConnectionProvider';

interface CompressedImageMessage {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  format: string;
  data: string | Uint8Array | number[];
}

interface RawImageMessage {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  height: number;
  width: number;
  encoding: string;
  is_bigendian: boolean;
  step: number;
  data: string | Uint8Array | number[];
}

type ImageMessage = CompressedImageMessage | RawImageMessage;

export default function PilotModeCamera(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Target 15 FPS for smooth video streaming
  const FRAME_RATE_MS = 67;

  // Process compressed image data
  const processCompressedImage = (message: CompressedImageMessage) => {
    try {
      if (!message?.data) return;

      let imageDataUrl: string;
      if (typeof message.data === 'string') {
        const mimeType = message.format.toLowerCase().includes('png') ? 'image/png' : 'image/jpeg';
        imageDataUrl = `data:${mimeType};base64,${message.data}`;
      } else {
        const uint8Data = message.data instanceof Uint8Array
          ? message.data
          : new Uint8Array(message.data);

        const blob = new Blob([uint8Data], { type: 'image/jpeg' });
        imageDataUrl = URL.createObjectURL(blob);
      }

      setImageUrl(imageDataUrl);
    } catch (error) {
      console.warn('Error processing compressed image:', error);
    }
  };

  // Process raw image data
  const processRawImage = (message: RawImageMessage) => {
    try {
      if (!message?.data || !message.width || !message.height) return;

      const canvas = document.createElement('canvas');
      canvas.width = message.width;
      canvas.height = message.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      const uint8Data = message.data instanceof Uint8Array
        ? message.data
        : new Uint8Array(message.data as number[]);

      if (message.encoding === 'rgb8') {
        const imageData = ctx.createImageData(message.width, message.height);
        for (let i = 0; i < uint8Data.length; i += 3) {
          const pixelIndex = (i / 3) * 4;
          imageData.data[pixelIndex] = uint8Data[i];     // R
          imageData.data[pixelIndex + 1] = uint8Data[i + 1]; // G
          imageData.data[pixelIndex + 2] = uint8Data[i + 2]; // B
          imageData.data[pixelIndex + 3] = 255; // Alpha
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (message.encoding === 'bgr8') {
        const imageData = ctx.createImageData(message.width, message.height);
        for (let i = 0; i < uint8Data.length; i += 3) {
          const pixelIndex = (i / 3) * 4;
          imageData.data[pixelIndex] = uint8Data[i + 2];     // R (from B)
          imageData.data[pixelIndex + 1] = uint8Data[i + 1]; // G
          imageData.data[pixelIndex + 2] = uint8Data[i];     // B (from R)
          imageData.data[pixelIndex + 3] = 255; // Alpha
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setImageUrl(canvas.toDataURL());
    } catch (error) {
      console.warn('Error processing raw image:', error);
    }
  };

  // Process incoming image message
  const processImageMessage = (message: ImageMessage) => {
    if ('format' in message) {
      processCompressedImage(message);
    } else {
      processRawImage(message);
    }
  };

  // Subscribe to image topics
  useEffect(() => {
    const setupSubscription = async () => {
      if (!selectedConnection?.rosInstance || selectedConnection.status !== 'connected') {
        setIsSubscribed(false);
        setImageUrl(null);
        return;
      }

      try {
        const ROSLIB = (await import('roslib')).default;

        // Try common camera topics in order of preference
        const topicsToTry = [
          { name: '/camera/image_raw/compressed', messageType: 'sensor_msgs/CompressedImage' },
          { name: '/camera/image/compressed', messageType: 'sensor_msgs/CompressedImage' },
          { name: '/camera/image_raw', messageType: 'sensor_msgs/Image' },
          { name: '/camera/image', messageType: 'sensor_msgs/Image' },
        ];

        for (const topicInfo of topicsToTry) {
          try {
            const topic = new ROSLIB.Topic({
              ros: selectedConnection.rosInstance,
              name: topicInfo.name,
              messageType: topicInfo.messageType,
            });

            topic.subscribe((message: any) => {
              if (intervalRef.current) {
                clearTimeout(intervalRef.current);
              }

              intervalRef.current = setTimeout(() => {
                processImageMessage(message);
              }, FRAME_RATE_MS);
            });

            setIsSubscribed(true);
            break; // Success, stop trying other topics
          } catch (error) {
            console.warn(`Failed to subscribe to ${topicInfo.name}:`, error);
            continue; // Try next topic
          }
        }
      } catch (error) {
        console.warn('Error setting up camera subscription:', error);
        setIsSubscribed(false);
      }
    };

    setupSubscription();

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
      setIsSubscribed(false);
    };
  }, [selectedConnection]);

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      {imageUrl ? (
        <img
          alt="Pilot Mode Camera Feed"
          className="w-full h-full object-cover"
          ref={imageRef}
          src={imageUrl}
          onError={() => {
            console.warn('Error displaying pilot mode camera image');
          }}
        />
      ) : (
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </div>
          <p className="text-lg text-gray-300 mb-2">NO CAMERA SIGNAL</p>
          <p className="text-sm text-gray-500">
            {!selectedConnection ? 'No connection' : isSubscribed ? 'Waiting for camera data...' : 'Camera not available'}
          </p>
        </div>
      )}
    </div>
  );
}