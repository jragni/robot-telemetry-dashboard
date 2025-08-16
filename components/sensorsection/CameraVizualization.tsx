'use client';

import { useEffect, useRef, useState } from 'react';

import { useConnection } from '@/components/dashboard/ConnectionProvider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CompressedImageMessage {
  header: {
    stamp: {
      sec: number;
      nanosec: number;
    };
    frame_id: string;
  };
  format: string;
  data: string | Uint8Array | number[]; // Support multiple data formats
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

export default function CameraVisualization(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const [imageTopics, setImageTopics] = useState<TopicInfo[]>([
    { name: '/camera/image_raw/compressed', type: 'compressed', messageType: 'sensor_msgs/CompressedImage' },
  ]);
  const [selectedTopic, setSelectedTopic] = useState<string>('/camera/image_raw/compressed');
  const [selectedTopicInfo, setSelectedTopicInfo] = useState<TopicInfo>({
    name: '/camera/image_raw/compressed',
    type: 'compressed',
    messageType: 'sensor_msgs/CompressedImage',
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isStreamingEnabled, setIsStreamingEnabled] = useState(false);
  const [frameCount, setFrameCount] = useState<number>(0);
  const [currentFPS, setCurrentFPS] = useState<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameTimestamps = useRef<number[]>([]);
  const fpsUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Target 15 FPS for smooth, stable video streaming
  const FRAME_RATE_MS = 67;

  // Calculate FPS based on recent frame timestamps
  const updateFPS = () => {
    const now = Date.now();
    const timestamps = frameTimestamps.current;

    // Keep only timestamps from the last 2 seconds for FPS calculation
    const twoSecondsAgo = now - 2000;
    const recentTimestamps = timestamps.filter(timestamp => timestamp > twoSecondsAgo);
    frameTimestamps.current = recentTimestamps;

    // Calculate FPS: frames in last 2 seconds / 2
    const fps = recentTimestamps.length / 2;
    setCurrentFPS(Math.round(fps * 10) / 10); // Round to 1 decimal place
  };

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
        const base64String = btoa(String.fromCharCode(...uint8Data));
        const mimeType = message.format.toLowerCase().includes('png') ? 'image/png' : 'image/jpeg';
        imageDataUrl = `data:${mimeType};base64,${base64String}`;
      }

      setImageUrl(imageDataUrl);
      updateFrameStats();
    } catch (error) {
      console.error('Error processing compressed image:', error);
    }
  };

  // Process raw image data
  const processRawImage = (message: RawImageMessage) => {
    try {
      if (!message?.data || !message.width || !message.height) return;

      // Convert raw image data to canvas and then to data URL
      const canvas = document.createElement('canvas');
      canvas.width = message.width;
      canvas.height = message.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.createImageData(message.width, message.height);
      const uint8Data = message.data instanceof Uint8Array
        ? message.data
        : typeof message.data === 'string'
          ? new Uint8Array(Array.from(atob(message.data), char => char.charCodeAt(0)))
          : new Uint8Array(message.data);

      // Handle different encodings
      if (message.encoding === 'rgb8') {
        for (let i = 0; i < uint8Data.length; i += 3) {
          const pixelIndex = (i / 3) * 4;
          imageData.data[pixelIndex] = uint8Data[i];     // R
          imageData.data[pixelIndex + 1] = uint8Data[i + 1]; // G
          imageData.data[pixelIndex + 2] = uint8Data[i + 2]; // B
          imageData.data[pixelIndex + 3] = 255;          // A
        }
      } else if (message.encoding === 'bgr8') {
        for (let i = 0; i < uint8Data.length; i += 3) {
          const pixelIndex = (i / 3) * 4;
          imageData.data[pixelIndex] = uint8Data[i + 2];     // R (from B)
          imageData.data[pixelIndex + 1] = uint8Data[i + 1]; // G
          imageData.data[pixelIndex + 2] = uint8Data[i];     // B (from R)
          imageData.data[pixelIndex + 3] = 255;              // A
        }
      } else if (message.encoding === 'mono8') {
        for (let i = 0; i < uint8Data.length; i++) {
          const pixelIndex = i * 4;
          const grayValue = uint8Data[i];
          imageData.data[pixelIndex] = grayValue;     // R
          imageData.data[pixelIndex + 1] = grayValue; // G
          imageData.data[pixelIndex + 2] = grayValue; // B
          imageData.data[pixelIndex + 3] = 255;       // A
        }
      } else {
        console.warn(`Unsupported encoding: ${message.encoding}`);
        return;
      }

      ctx.putImageData(imageData, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/png');
      setImageUrl(imageDataUrl);
      updateFrameStats();
    } catch (error) {
      console.error('Error processing raw image:', error);
    }
  };

  // Update frame statistics
  const updateFrameStats = () => {
    setFrameCount(prev => prev + 1);

    // Record frame timestamp for FPS calculation
    const now = Date.now();
    frameTimestamps.current.push(now);

    // Limit stored timestamps to prevent memory growth
    if (frameTimestamps.current.length > 20) {
      frameTimestamps.current = frameTimestamps.current.slice(-20);
    }
  };

  // Process image data based on topic type
  const processImageMessage = (message: ImageMessage) => {
    if (selectedTopicInfo.type === 'compressed') {
      processCompressedImage(message as CompressedImageMessage);
    } else {
      processRawImage(message as RawImageMessage);
    }
  };

  // Fetch available image topics (both compressed and raw)
  useEffect(() => {
    if (!selectedConnection?.rosInstance) {
      const defaultTopics = [{ name: '/camera/image_raw/compressed', type: 'compressed' as const, messageType: 'sensor_msgs/CompressedImage' }];
      setImageTopics(defaultTopics);
      return;
    }

    const { rosInstance } = selectedConnection;

    const fetchTopics = async () => {
      try {
        const ROSLIB = await import('roslib');
        const allTopics: TopicInfo[] = [];

        // Helper function to get topics for a specific type
        const getTopicsForType = (messageType: string): Promise<string[]> => {
          return new Promise((resolve, _reject) => {
            console.log(`Searching for topics of type: ${messageType}`);

            const service = new ROSLIB.default.Service({
              ros: rosInstance,
              name: '/rosapi/topics_for_type',
              serviceType: 'rosapi/TopicsForType',
            });

            const request = new ROSLIB.default.ServiceRequest({
              type: messageType,
            });

            service.callService(
              request,
              (result: any) => {
                console.log(`Results for ${messageType}:`, result);
                resolve(result?.topics ?? []);
              },
              (error: any) => {
                console.warn(`Error fetching topics for ${messageType}:`, error);
                resolve([]);
              },
            );
          });
        };

        // Fetch both topic types in parallel - try both ROS1 and ROS2 formats
        const [
          compressedTopics,
          compressedTopicsRos2,
          rawTopics,
          rawTopicsRos2,
        ] = await Promise.all([
          getTopicsForType('sensor_msgs/CompressedImage'),
          getTopicsForType('sensor_msgs/msg/CompressedImage'),
          getTopicsForType('sensor_msgs/Image'),
          getTopicsForType('sensor_msgs/msg/Image'),
        ]);

        // Combine topics from both formats
        const allCompressedTopics = [...compressedTopics, ...compressedTopicsRos2];
        const allRawTopics = [...rawTopics, ...rawTopicsRos2];

        // Add compressed topics (deduplicated)
        if (allCompressedTopics.length > 0) {
          const uniqueCompressedTopics = [...new Set(allCompressedTopics)];
          const compressedTopicInfos: TopicInfo[] = uniqueCompressedTopics.map((topic: string) => ({
            name: topic,
            type: 'compressed' as const,
            messageType: 'sensor_msgs/CompressedImage',
          }));
          allTopics.push(...compressedTopicInfos);
        }

        // Add raw topics (deduplicated)
        if (allRawTopics.length > 0) {
          const uniqueRawTopics = [...new Set(allRawTopics)];
          const rawTopicInfos: TopicInfo[] = uniqueRawTopics.map((topic: string) => ({
            name: topic,
            type: 'raw' as const,
            messageType: 'sensor_msgs/Image',
          }));
          allTopics.push(...rawTopicInfos);
        }

        // Update state with all found topics
        if (allTopics.length > 0) {
          setImageTopics(allTopics);

          // Update selected topic if current one is not available
          const currentTopicExists = allTopics.some(t => t.name === selectedTopic);
          if (!currentTopicExists) {
            const preferredTopic = allTopics.find(t => t.name === '/camera/image_raw/compressed')
              ?? allTopics.find(t => t.type === 'compressed')
              ?? allTopics[0];
            setSelectedTopic(preferredTopic.name);
            setSelectedTopicInfo(preferredTopic);
          } else {
            const topicInfo = allTopics.find(t => t.name === selectedTopic);
            if (topicInfo) {
              setSelectedTopicInfo(topicInfo);
            }
          }
        } else {
          // Fallback to default
          const defaultTopics = [{ name: '/camera/image_raw/compressed', type: 'compressed' as const, messageType: 'sensor_msgs/CompressedImage' }];
          setImageTopics(defaultTopics);
          setSelectedTopic('/camera/image_raw/compressed');
          setSelectedTopicInfo(defaultTopics[0]);
        }

        // Fallback: If no topics found via rosapi, try getting all topics and filtering
        if (allTopics.length === 0) {
          console.log('No topics found via rosapi, trying fallback method...');

          rosInstance.getTopics(
            ({ topics, types }: { topics: string[]; types: string[] }) => {
              console.log('All available topics:', topics);
              console.log('All available types:', types);

              const fallbackTopics: TopicInfo[] = [];

              topics.forEach((topic, index) => {
                const messageType = types[index];
                if (messageType === 'sensor_msgs/CompressedImage' || messageType === 'sensor_msgs/msg/CompressedImage') {
                  fallbackTopics.push({
                    name: topic,
                    type: 'compressed',
                    messageType: 'sensor_msgs/CompressedImage',
                  });
                } else if (messageType === 'sensor_msgs/Image' || messageType === 'sensor_msgs/msg/Image') {
                  fallbackTopics.push({
                    name: topic,
                    type: 'raw',
                    messageType: 'sensor_msgs/Image',
                  });
                }
              });

              console.log('Fallback discovered topics:', fallbackTopics);

              if (fallbackTopics.length > 0) {
                setImageTopics(fallbackTopics);

                // Update selected topic if needed
                const currentTopicExists = fallbackTopics.some(t => t.name === selectedTopic);
                if (!currentTopicExists) {
                  const preferredTopic = fallbackTopics.find(t => t.name === '/camera/image_raw/compressed') ??
                                       fallbackTopics.find(t => t.type === 'compressed') ??
                                       fallbackTopics[0];
                  setSelectedTopic(preferredTopic.name);
                  setSelectedTopicInfo(preferredTopic);
                } else {
                  const topicInfo = fallbackTopics.find(t => t.name === selectedTopic);
                  if (topicInfo) {
                    setSelectedTopicInfo(topicInfo);
                  }
                }
              }
            },
            (error: any) => {
              console.warn('Failed to get topics via fallback method:', error);
            },
          );
        }
      } catch (error) {
        console.warn('Failed to fetch image topics:', error);
        const defaultTopics = [{ name: '/camera/image_raw/compressed', type: 'compressed' as const, messageType: 'sensor_msgs/CompressedImage' }];
        setImageTopics(defaultTopics);
        setSelectedTopic('/camera/image_raw/compressed');
        setSelectedTopicInfo(defaultTopics[0]);
      }
    };

    fetchTopics();
  }, [selectedConnection]);

  // Handle topic selection changes
  useEffect(() => {
    const topicInfo = imageTopics.find(t => t.name === selectedTopic);
    if (topicInfo) {
      setSelectedTopicInfo(topicInfo);
    }
  }, [selectedTopic, imageTopics]);

  // Subscribe to image topic (compressed or raw)
  useEffect(() => {
    let imageTopic: any = null;

    const setupSubscription = async () => {
      if (!selectedConnection?.rosInstance || selectedConnection.status !== 'connected' || !isStreamingEnabled) {
        setIsSubscribed(false);
        if (!isStreamingEnabled) {
          setImageUrl(null);
          setFrameCount(0);
          setCurrentFPS(0);
          frameTimestamps.current = [];
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (fpsUpdateInterval.current) {
          clearInterval(fpsUpdateInterval.current);
          fpsUpdateInterval.current = null;
        }
        return;
      }

      try {
        const ROSLIB = await import('roslib');

        // Create topic subscription with appropriate message type
        imageTopic = new ROSLIB.default.Topic({
          ros: selectedConnection.rosInstance,
          name: selectedTopic,
          messageType: selectedTopicInfo.messageType,
        });

        // Store latest message for processing
        let latestMessage: ImageMessage | null = null;

        // Subscribe to messages
        imageTopic.subscribe((message: ImageMessage) => {
          latestMessage = message;
        });

        // Process messages at controlled rate (15 FPS)
        intervalRef.current = setInterval(() => {
          if (latestMessage) {
            const messageToProcess = latestMessage;
            latestMessage = null; // Clear before processing to avoid race conditions

            // Use RAF for smooth updates
            requestAnimationFrame(() => {
              processImageMessage(messageToProcess);
            });
          }
        }, FRAME_RATE_MS);

        // Start FPS calculation interval (update every 500ms)
        fpsUpdateInterval.current = setInterval(updateFPS, 500);

        setIsSubscribed(true);
      } catch (error) {
        console.error('Failed to setup camera subscription:', error);
        setIsSubscribed(false);
      }
    };

    setupSubscription();

    return () => {
      if (imageTopic) {
        imageTopic.unsubscribe();
        setIsSubscribed(false);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (fpsUpdateInterval.current) {
        clearInterval(fpsUpdateInterval.current);
        fpsUpdateInterval.current = null;
      }
    };
  }, [selectedConnection, selectedTopic, selectedTopicInfo, isStreamingEnabled]);

  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <div className="h-full bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-gray-400">
        <p className="text-sm">Camera: No connection</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-800 border border-gray-600 rounded flex flex-col">
      {/* Responsive Header - Drone Operator Style */}
      <div className="px-3 py-2 bg-gray-900/80 border-b border-gray-600">
        {/* Desktop: Single row layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-100 uppercase tracking-wide">
              Camera
            </h3>
            <div className="flex items-center gap-2">
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger
                  aria-label="Select camera topic"
                  className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-40"
                  id="camera-topic-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageTopics.map((topicInfo) => (
                    <SelectItem key={topicInfo.name} value={topicInfo.name}>
                      {topicInfo.name} ({topicInfo.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Compact Status Indicators */}
            <div className="flex items-center gap-2 text-xs">
              {isSubscribed && isStreamingEnabled && (
                <>
                  <span className="text-green-400 font-mono">{currentFPS} FPS</span>
                  <span className="text-blue-400 font-mono">{frameCount}</span>
                </>
              )}
              <div className={`w-2 h-2 rounded-full ${
                isStreamingEnabled && isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
            </div>

            <Button
              aria-label={isStreamingEnabled ? 'Stop camera stream' : 'Start camera stream'}
              className="h-7 text-xs px-3"
              onClick={() => setIsStreamingEnabled(!isStreamingEnabled)}
              size="sm"
              variant={isStreamingEnabled ? 'destructive' : 'default'}
            >
              {isStreamingEnabled ? 'STOP' : 'START'}
            </Button>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-100 uppercase tracking-wide">
              Camera
            </h3>
            <Button
              aria-label={isStreamingEnabled ? 'Stop camera stream' : 'Start camera stream'}
              className="h-7 text-xs px-3"
              onClick={() => setIsStreamingEnabled(!isStreamingEnabled)}
              size="sm"
              variant={isStreamingEnabled ? 'destructive' : 'default'}
            >
              {isStreamingEnabled ? 'STOP' : 'START'}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Select onValueChange={setSelectedTopic} value={selectedTopic}>
              <SelectTrigger
                aria-label="Select camera topic"
                className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-full"
                id="camera-topic-select-mobile"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {imageTopics.map((topicInfo) => (
                  <SelectItem key={topicInfo.name} value={topicInfo.name}>
                    {topicInfo.name} ({topicInfo.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-center gap-2 text-xs">
              {isSubscribed && isStreamingEnabled && (
                <>
                  <span className="text-green-400 font-mono">{currentFPS} FPS</span>
                  <span className="text-blue-400 font-mono">{frameCount}</span>
                </>
              )}
              <div className={`w-2 h-2 rounded-full ${
                isStreamingEnabled && isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Display - Full area */}
      <div className="flex-1 relative bg-black overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {imageUrl ? (
            <img
              alt="Live camera feed from robot"
              className="w-full h-full object-contain"
              ref={imageRef}
              src={imageUrl}
              onError={() => {
                console.warn('Error displaying camera image');
              }}
              onLoad={() => {
                // Image loaded successfully
              }}
            />
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-700 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} />
                </svg>
              </div>
              <p className="text-sm text-gray-400 mb-1">NO SIGNAL</p>
              <p className="text-xs text-gray-500">
                {!isStreamingEnabled ? 'Stream stopped' : isSubscribed ? 'Waiting...' : 'No connection'}
              </p>
            </div>
          )}
        </div>

        {/* HUD Overlay Elements */}
        {imageUrl && (
          <div className="absolute top-2 left-2">
            <div className="bg-black/60 text-white px-2 py-1 rounded text-xs font-mono">
              LIVE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
