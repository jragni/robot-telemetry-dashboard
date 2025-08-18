'use client';

import { useRef } from 'react';

import { useCamera } from '@/components/dashboard/CameraProvider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CameraVisualization(): React.ReactNode {
  const {
    imageUrl,
    isSubscribed,
    isStreamingEnabled,
    currentFPS,
    frameCount,
    selectedTopic,
    imageTopics,
    setSelectedTopic,
    setIsStreamingEnabled,
  } = useCamera();
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <div className="w-full bg-gray-800 border border-gray-600 rounded flex flex-col h-full">
      {/* Header - Drone Operator Style */}
      <div className="px-3 py-2 bg-gray-900/80 border-b border-gray-600">
        {/* Desktop: Single row layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-100 uppercase tracking-wide">
              Camera
            </h3>
            {imageTopics.length > 0 && (
              <div className="flex items-center gap-2">
                <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                  <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {imageTopics.map((topic) => (
                      <SelectItem key={topic.name} value={topic.name}>
                        {topic.name} ({topic.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">FPS:</span>
              <span className="font-mono text-gray-200 min-w-[2rem]">{currentFPS.toFixed(1)}</span>
              <span className="text-gray-400">Frames:</span>
              <span className="font-mono text-gray-200 min-w-[3rem]">{frameCount}</span>
            </div>
            <Button
              onClick={() => setIsStreamingEnabled(!isStreamingEnabled)}
              size="sm"
              className={`h-6 px-3 text-xs ${
                isStreamingEnabled
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isStreamingEnabled ? 'Stop' : 'Start'}
            </Button>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                isStreamingEnabled && isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-100 uppercase tracking-wide">
              Camera
            </h3>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsStreamingEnabled(!isStreamingEnabled)}
                size="sm"
                className={`h-6 px-2 text-xs ${
                  isStreamingEnabled
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isStreamingEnabled ? 'Stop' : 'Start'}
              </Button>
              <div className={`w-2 h-2 rounded-full ${
                isStreamingEnabled && isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {imageTopics.length > 0 && (
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {imageTopics.map((topic) => (
                    <SelectItem key={topic.name} value={topic.name}>
                      {topic.name} ({topic.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-400">FPS:</span>
              <span className="font-mono text-gray-200">{currentFPS.toFixed(1)}</span>
              <span className="text-gray-400">Frames:</span>
              <span className="font-mono text-gray-200">{frameCount}</span>
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