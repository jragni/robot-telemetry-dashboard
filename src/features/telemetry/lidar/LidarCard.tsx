import { Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_LIDAR_TOPIC } from './constants';
import type { LidarCardProps } from './definitions';
import { useLidarZoom } from './LidarZoomContext';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LaserScanMessage } from '@/features/ros/definitions';
import { useRosContext } from '@/features/ros/RosContext';
import { useSubscriber } from '@/features/ros/useSubscriber';
import { useTopics } from '@/features/ros/useTopics';

function LidarCard({ compact = false }: LidarCardProps) {
  const { connectionState } = useRosContext();
  const [lidarTopic, setLidarTopic] = useState(DEFAULT_LIDAR_TOPIC);
  const { viewRange, zoomIn, zoomOut, canZoomIn, canZoomOut } = useLidarZoom();

  // Fetch available topics dynamically
  const { topics } = useTopics();

  // Filter topics to only show LaserScan topics
  const lidarTopics = useMemo(() => {
    return topics
      .filter((topic) => topic.type === 'sensor_msgs/msg/LaserScan')
      .map((topic) => topic.name);
  }, [topics]);

  // Auto-select first available LIDAR topic
  useEffect(() => {
    if (lidarTopics.length > 0 && !lidarTopics.includes(lidarTopic)) {
      setLidarTopic(lidarTopics[0]);
    }
  }, [lidarTopics, lidarTopic]);

  const { data: lidarData, loading } = useSubscriber<LaserScanMessage>({
    topic: lidarTopic,
    messageType: 'sensor_msgs/msg/LaserScan',
    throttleRate: 200, // 5 Hz
    enabled: connectionState === 'connected',
  });

  const isConnected = connectionState === 'connected';

  // Zoom controls - use context methods with max range from sensor
  const maxRange = lidarData?.range_max
    ? Math.max(lidarData.range_max, 50)
    : 50;

  const handleZoomIn = () => zoomIn();
  const handleZoomOut = () => zoomOut(maxRange);

  const canZoomInEnabled = canZoomIn;
  const canZoomOutEnabled = canZoomOut(maxRange);

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col min-h-0">
      {!compact && (
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
            LIDAR
          </h3>
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border-2 border-[#4A4A4A] rounded-md bg-background h-8">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleZoomIn}
                disabled={!isConnected || !canZoomInEnabled}
                className="h-8 w-8 hover:bg-[#1A1A1A] focus-visible:border-amber-600 transition-all"
                aria-label="Zoom in"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="text-[13px] font-mono text-gray-900 dark:text-[#E8E8E8] px-2 min-w-[45px] text-center">
                {viewRange.toFixed(0)}m
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleZoomOut}
                disabled={!isConnected || !canZoomOutEnabled}
                className="h-8 w-8 hover:bg-[#1A1A1A] focus-visible:border-amber-600 transition-all"
                aria-label="Zoom out"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            {/* Topic selector */}
            <Select
              value={lidarTopic}
              onValueChange={setLidarTopic}
              disabled={!isConnected || lidarTopics.length === 0}
            >
              <SelectTrigger
                size="sm"
                className="text-[13px] font-mono w-auto bg-card text-gray-900 dark:text-[#E8E8E8] border-2 border-[#4A4A4A] hover:bg-[#1A1A1A] hover:border-[#6A6A6A] focus-visible:border-amber-600 transition-all"
              >
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#E8E8E8] border-2 border-gray-300 dark:border-[#5A5A5A] shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                {lidarTopics.length > 0 ? (
                  lidarTopics.map((topic) => (
                    <SelectItem
                      key={topic}
                      value={topic}
                      className="text-[13px] font-mono hover:bg-gray-100 dark:hover:bg-[#1A1A1A] focus:bg-gray-100 dark:focus:bg-[#1A1A1A] data-[state=checked]:bg-emerald-100 dark:data-[state=checked]:bg-[#1A4D2E] data-[state=checked]:text-emerald-900 dark:data-[state=checked]:text-white data-[state=checked]:font-semibold data-[state=checked]:border-l-4 data-[state=checked]:border-l-emerald-500 transition-colors cursor-pointer"
                    >
                      {topic}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled className="text-[13px]">
                    No LaserScan topics found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div
        className={`relative ${compact ? 'h-full' : 'flex-1'} bg-secondary border border-border rounded-sm overflow-hidden`}
      >
        {!isConnected ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-xs font-mono text-muted-foreground text-center">
              Not connected to robot
            </p>
          </div>
        ) : loading || !lidarData ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-xs font-mono text-muted-foreground">
              Waiting for LIDAR data...
            </p>
          </div>
        ) : (
          <>
            {/* Lidar polar grid */}
            <svg
              className="w-full h-full"
              viewBox="-100 -100 200 200"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid circles */}
              {[25, 50, 75, 100].map((r) => (
                <circle
                  key={r}
                  cx="0"
                  cy="0"
                  r={r}
                  fill="none"
                  stroke="rgb(100 116 139)"
                  strokeWidth="0.7"
                  opacity="0.6"
                />
              ))}

              {/* Grid lines */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
                const rad = (angle * Math.PI) / 180;
                return (
                  <line
                    key={angle}
                    x1="0"
                    y1="0"
                    x2={Math.cos(rad) * 100}
                    y2={Math.sin(rad) * 100}
                    stroke="rgb(100 116 139)"
                    strokeWidth="0.7"
                    opacity="0.6"
                  />
                );
              })}

              {/* Lidar points */}
              {lidarData.ranges.map((range, i) => {
                // Skip points beyond view range
                if (range > viewRange) return null;

                const angle =
                  lidarData.angle_min +
                  i * lidarData.angle_increment -
                  Math.PI / 2;
                // Normalize based on view range instead of sensor max
                const normalizedRange = (range / viewRange) * 100;
                const x = Math.cos(angle) * normalizedRange;
                const y = Math.sin(angle) * normalizedRange;

                // Distance-based coloring relative to view range
                const distanceRatio = range / viewRange;
                let color: string;
                if (distanceRatio < 0.3) {
                  // Near: Red (danger)
                  color = 'rgb(239 68 68)';
                } else if (distanceRatio < 0.6) {
                  // Medium: Yellow (caution)
                  color = 'rgb(234 179 8)';
                } else {
                  // Far: Green (safe)
                  color = 'rgb(34 197 94)';
                }

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="0.8"
                    fill={color}
                    opacity="0.8"
                  />
                );
              })}

              {/* Robot center */}
              <circle cx="0" cy="0" r="3" fill="rgb(239 68 68)" />
            </svg>
          </>
        )}

        {/* Compact mode overlays */}
        {compact && isConnected && lidarData && (
          <>
            <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-2">
              <Select
                value={lidarTopic}
                onValueChange={setLidarTopic}
                disabled={!isConnected || lidarTopics.length === 0}
              >
                <SelectTrigger
                  size="sm"
                  className="text-[13px] font-mono w-auto bg-card/90 backdrop-blur-sm text-gray-900 dark:text-[#E8E8E8] border-2 border-[#4A4A4A] hover:bg-[#1A1A1A] hover:border-[#6A6A6A] focus-visible:border-amber-600 transition-all"
                >
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#E8E8E8] border-2 border-gray-300 dark:border-[#5A5A5A] shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                  {lidarTopics.length > 0 ? (
                    lidarTopics.map((topic) => (
                      <SelectItem
                        key={topic}
                        value={topic}
                        className="text-[13px] font-mono hover:bg-gray-100 dark:hover:bg-[#1A1A1A] focus:bg-gray-100 dark:focus:bg-[#1A1A1A] data-[state=checked]:bg-emerald-100 dark:data-[state=checked]:bg-[#1A4D2E] data-[state=checked]:text-emerald-900 dark:data-[state=checked]:text-white data-[state=checked]:font-semibold data-[state=checked]:border-l-4 data-[state=checked]:border-l-emerald-500 transition-colors cursor-pointer"
                      >
                        {topic}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled className="text-[13px]">
                      No LaserScan topics found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {/* Zoom controls */}
              <div className="flex items-center gap-1 border-2 border-[#4A4A4A] rounded-md bg-card/90 backdrop-blur-sm h-8">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomIn}
                  disabled={!canZoomInEnabled}
                  className="h-8 w-8 hover:bg-[#1A1A1A] focus-visible:border-amber-600 transition-all"
                  aria-label="Zoom in"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <div className="text-[13px] font-mono text-gray-900 dark:text-[#E8E8E8] px-2 min-w-[45px] text-center">
                  {viewRange.toFixed(0)}m
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleZoomOut}
                  disabled={!canZoomOutEnabled}
                  className="h-8 w-8 hover:bg-[#1A1A1A] focus-visible:border-amber-600 transition-all"
                  aria-label="Zoom out"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="absolute bottom-2 left-2 text-xs font-mono text-muted-foreground bg-card/90 backdrop-blur-sm px-2 py-1 rounded-sm">
              View: {viewRange.toFixed(1)}m | Max:{' '}
              {lidarData.range_max.toFixed(1)}m
            </div>
          </>
        )}

        {/* Normal mode info */}
        {!compact && isConnected && lidarData && (
          <>
            <div className="absolute bottom-2 left-2 text-xs font-mono text-muted-foreground">
              View: {viewRange.toFixed(1)}m | Max:{' '}
              {lidarData.range_max.toFixed(1)}m
            </div>
            {/* Color legend */}
            <div className="absolute bottom-2 right-2 flex items-center gap-2 text-[10px] font-mono">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Near</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Mid</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-muted-foreground">Far</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LidarCard;
