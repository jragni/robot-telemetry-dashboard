'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useConnection } from './ConnectionProvider';

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

interface TopicInfo {
  name: string;
  type: 'compressed' | 'raw';
  messageType: string;
}

interface CameraContextType {
  imageUrl: string | null;
  isSubscribed: boolean;
  isStreamingEnabled: boolean;
  currentFPS: number;
  frameCount: number;
  selectedTopic: string;
  imageTopics: TopicInfo[];
  setSelectedTopic: (topic: string) => void;
  setIsStreamingEnabled: (enabled: boolean) => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export function CameraProvider({ children }: { children: ReactNode }) {
  const { selectedConnection } = useConnection();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(false);
  const [currentFPS, setCurrentFPS] = useState<number>(0);
  const [frameCount, setFrameCount] = useState<number>(0);
  const [selectedTopic, setSelectedTopic] = useState<string>('/camera/image_raw/compressed');
  const [imageTopics, setImageTopics] = useState<TopicInfo[]>([
    {
      name: '/camera/image_raw/compressed',
      type: 'compressed',
      messageType: 'sensor_msgs/msg/CompressedImage',
    },
  ]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameTimestamps = useRef<number[]>([]);
  const fpsUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const lastFrameTime = useRef<number>(0);

  // NO ARTIFICIAL DELAY - process frames immediately

  // Calculate FPS based on actual rendered frames
  const updateFPS = () => {
    const now = Date.now();
    const timestamps = frameTimestamps.current;

    // Keep only timestamps from the last 2 seconds for stable FPS calculation
    const twoSecondsAgo = now - 2000;
    const recentTimestamps = timestamps.filter(timestamp => timestamp > twoSecondsAgo);
    frameTimestamps.current = recentTimestamps;

    // Calculate FPS: frames in last 2 seconds / 2
    const fps = recentTimestamps.length / 2;
    setCurrentFPS(Math.round(fps * 10) / 10);
  };

  // Update frame stats - only when we actually render a new frame
  const updateFrameStats = useCallback(() => {
    const now = Date.now();

    // Throttle FPS counting to prevent impossible frame rates
    // Only count as a new frame if at least 16ms has passed (60 FPS max)
    if (now - lastFrameTime.current >= 16) {
      frameTimestamps.current.push(now);
      setFrameCount(prev => prev + 1);
      lastFrameTime.current = now;
    }
  }, []);

  // Process compressed image data with optimized base64 conversion
  const processCompressedImage = useCallback((message: CompressedImageMessage) => {
    try {
      if (!message?.data) return;

      let imageDataUrl: string;
      if (typeof message.data === 'string') {
        // Data already base64 encoded
        const mimeType = message.format.toLowerCase().includes('png') ? 'image/png' : 'image/jpeg';
        imageDataUrl = `data:${mimeType};base64,${message.data}`;
      } else {
        // Optimize base64 conversion for large arrays
        const uint8Data = message.data instanceof Uint8Array
          ? message.data
          : new Uint8Array(message.data);
        // Use more efficient base64 conversion for large data
        let base64String: string;if (uint8Data.length > 100000) {
          // For large images, process in chunks to avoid call stack overflow
          const chunkSize = 8192;
          let result = '';
          for (let i = 0; i < uint8Data.length; i += chunkSize) {
            const chunk = uint8Data.subarray(i, i + chunkSize);
            result += String.fromCharCode.apply(null, Array.from(chunk));
          }
          base64String = btoa(result);
        } else {
          base64String = btoa(String.fromCharCode(...uint8Data));
        }

        const mimeType = message.format.toLowerCase().includes('png') ? 'image/png' : 'image/jpeg';
        imageDataUrl = `data:${mimeType};base64,${base64String}`;
      }

      setImageUrl(imageDataUrl);
      updateFrameStats();
    } catch {
      // Error processing compressed image
    }
  }, [updateFrameStats]);

  // Process raw image data
  const processRawImage = useCallback((message: RawImageMessage) => {
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
          imageData.data[pixelIndex] = uint8Data[i];
          imageData.data[pixelIndex + 1] = uint8Data[i + 1];
          imageData.data[pixelIndex + 2] = uint8Data[i + 2];
          imageData.data[pixelIndex + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (message.encoding === 'bgr8') {
        const imageData = ctx.createImageData(message.width, message.height);
        for (let i = 0; i < uint8Data.length; i += 3) {
          const pixelIndex = (i / 3) * 4;
          imageData.data[pixelIndex] = uint8Data[i + 2];
          imageData.data[pixelIndex + 1] = uint8Data[i + 1];
          imageData.data[pixelIndex + 2] = uint8Data[i];
          imageData.data[pixelIndex + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      setImageUrl(canvas.toDataURL());
      updateFrameStats();
    } catch {
      // Error processing raw image
    }
  }, [updateFrameStats]);


  // Process incoming image message
  const processImageMessage = useCallback((message: ImageMessage) => {
    if ('format' in message) {
      processCompressedImage(message);
    } else {
      processRawImage(message);
    }
  }, [processCompressedImage, processRawImage]);

  // Setup FPS monitoring
  useEffect(() => {
    if (fpsUpdateInterval.current) {
      clearInterval(fpsUpdateInterval.current);
    }
    // Update FPS every 1 second for stable readings
    fpsUpdateInterval.current = setInterval(updateFPS, 1000);

    return () => {
      if (fpsUpdateInterval.current) {
        clearInterval(fpsUpdateInterval.current);
      }
    };
  }, []);

  // Fetch available image topics
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedConnection?.rosInstance) {
        setImageTopics([
          {
            name: '/camera/image_raw/compressed',
            type: 'compressed',
            messageType: 'sensor_msgs/msg/CompressedImage',
          },
        ]);
        return;
      }

      try {
        const ROSLIB = (await import('roslib')).default;

        // Fetch compressed image topics
        const getCompressedTopics = new ROSLIB.Service({
          ros: selectedConnection.rosInstance,
          name: '/rosapi/topics_for_type',
          serviceType: 'rosapi/TopicsForType',
        });

        const compressedRequest = new ROSLIB.ServiceRequest({
          type: 'sensor_msgs/msg/CompressedImage',
        });

        getCompressedTopics.callService(compressedRequest, (result: { topics?: string[] }) => {
          const compressedTopics = result?.topics?.map(topic => ({
            name: topic,
            type: 'compressed' as const,
            messageType: 'sensor_msgs/msg/CompressedImage',
          })) ?? [];

          // Fetch raw image topics
          const getRawTopics = new ROSLIB.Service({
            ros: selectedConnection.rosInstance!,
            name: '/rosapi/topics_for_type',
            serviceType: 'rosapi/TopicsForType',
          });

          const rawRequest = new ROSLIB.ServiceRequest({
            type: 'sensor_msgs/msg/Image',
          });

          getRawTopics.callService(rawRequest, (rawResult: { topics?: string[] }) => {
            const rawTopics = rawResult?.topics?.map(topic => ({
              name: topic,
              type: 'raw' as const,
              messageType: 'sensor_msgs/msg/Image',
            })) ?? [];

            const allTopics = [...compressedTopics, ...rawTopics];

            if (allTopics.length > 0) {
              setImageTopics(allTopics);
              if (!allTopics.find(t => t.name === selectedTopic)) {
                const preferredTopic = allTopics.find(t => t.name.includes('compressed')) ??
                                      allTopics[0];
                setSelectedTopic(preferredTopic.name);
              }
            } else {
              setImageTopics([
                {
                  name: '/camera/image_raw/compressed',
                  type: 'compressed',
                  messageType: 'sensor_msgs/msg/CompressedImage',
                },
              ]);
            }
          });
        });
      } catch {
        // Failed to fetch camera topics
      }
    };

    fetchTopics();
  }, [selectedConnection, selectedTopic]);

  // Subscribe to selected camera topic
  useEffect(() => {
    const setupSubscription = async () => {
      if (
        !selectedConnection?.rosInstance
        || selectedConnection.status !== 'connected'
        || !isStreamingEnabled
      ) {
        setIsSubscribed(false);
        setImageUrl(null);
        return;
      }

      try {
        const ROSLIB = (await import('roslib')).default;
        const topicInfo = imageTopics.find(t => t.name === selectedTopic);
        if (!topicInfo) return;

        const topic = new ROSLIB.Topic({
          ros: selectedConnection.rosInstance,
          name: selectedTopic,
          messageType: topicInfo.messageType,
        });

        topic.subscribe((message: any) => {
          // NO THROTTLING - process every frame immediately
          processImageMessage(message);
        });

        setIsSubscribed(true);
      } catch {
        // Error setting up camera subscription
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
  }, [selectedConnection, selectedTopic, isStreamingEnabled, imageTopics, processImageMessage]);

  return (
    <CameraContext.Provider value={{
      imageUrl,
      isSubscribed,
      isStreamingEnabled,
      currentFPS,
      frameCount,
      selectedTopic,
      imageTopics,
      setSelectedTopic,
      setIsStreamingEnabled,
    }}>
      {children}
    </CameraContext.Provider>
  );
}

export function useCamera() {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
}