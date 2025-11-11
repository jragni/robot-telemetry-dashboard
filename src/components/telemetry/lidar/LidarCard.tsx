import { useEffect, useMemo, useState } from 'react';

import { LidarColorLegend } from './components/LidarColorLegend';
import { LidarInfoDisplay } from './components/LidarInfoDisplay';
import { LidarStatusMessage } from './components/LidarStatusMessage';
import { LidarTopicSelector } from './components/LidarTopicSelector';
import { LidarVisualization } from './components/LidarVisualization';
import { LidarZoomControls } from './components/LidarZoomControls';
import { DEFAULT_LIDAR_TOPIC } from './constants';
import type { LidarCardProps } from './definitions';
import { filterLidarTopics } from './helpers';

import { useLidarZoom } from '@/contexts/lidar-zoom/LidarZoomContext';
import type { LaserScanMessage } from '@/contexts/ros/definitions';
import { useRosContext } from '@/contexts/ros/RosContext';
import { useSubscriber } from '@/hooks/ros/useSubscriber';
import { useTopics } from '@/hooks/ros/useTopics';

function LidarCard({ compact = false }: LidarCardProps) {
  const { connectionState } = useRosContext();
  const [lidarTopic, setLidarTopic] = useState(DEFAULT_LIDAR_TOPIC);
  const { viewRange, zoomIn, zoomOut, canZoomIn, canZoomOut } = useLidarZoom();

  // Fetch available topics dynamically
  const { topics } = useTopics();

  // Filter topics to only show LaserScan topics
  const lidarTopics = useMemo(() => filterLidarTopics(topics), [topics]);

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
            <LidarZoomControls
              viewRange={viewRange}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              canZoomIn={canZoomInEnabled}
              canZoomOut={canZoomOutEnabled}
              isConnected={isConnected}
            />
            <LidarTopicSelector
              selectedTopic={lidarTopic}
              onTopicChange={setLidarTopic}
              topics={lidarTopics}
              isConnected={isConnected}
            />
          </div>
        </div>
      )}

      <div
        className={`relative ${compact ? 'h-full' : 'flex-1'} bg-secondary border border-border rounded-sm overflow-hidden`}
      >
        <LidarStatusMessage
          isConnected={isConnected}
          loading={loading}
          hasData={!!lidarData}
        />
        {isConnected && !loading && lidarData && (
          <LidarVisualization lidarData={lidarData} viewRange={viewRange} />
        )}

        {/* Compact mode overlays */}
        {compact && isConnected && lidarData && (
          <>
            <div className="absolute top-2 left-2 right-2 z-10 flex items-center gap-2">
              <LidarTopicSelector
                selectedTopic={lidarTopic}
                onTopicChange={setLidarTopic}
                topics={lidarTopics}
                isConnected={isConnected}
                compact
              />
              <LidarZoomControls
                viewRange={viewRange}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                canZoomIn={canZoomInEnabled}
                canZoomOut={canZoomOutEnabled}
                isConnected={isConnected}
                compact
              />
            </div>
            <LidarInfoDisplay
              viewRange={viewRange}
              maxRange={lidarData.range_max}
              compact
            />
          </>
        )}

        {/* Normal mode info */}
        {!compact && isConnected && lidarData && (
          <>
            <LidarInfoDisplay
              viewRange={viewRange}
              maxRange={lidarData.range_max}
            />
            <LidarColorLegend />
          </>
        )}
      </div>
    </div>
  );
}

export default LidarCard;
