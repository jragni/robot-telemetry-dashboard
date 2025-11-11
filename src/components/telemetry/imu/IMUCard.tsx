import { BarChart3, Grid3x3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DigitalView } from './components/DigitalView';
import { IMUStatusMessage } from './components/IMUStatusMessage';
import { IMUTopicSelector } from './components/IMUTopicSelector';
import PlotView from './components/PlotView';
import { DEFAULT_PLOT_TOPIC } from './constants';
import type { ViewMode } from './definitions';
import { filterImuTopics, transformImuMessage } from './helpers';

import { Button } from '@/components/ui/button';
import type { ImuMessage } from '@/contexts/ros/definitions';
import { useRosContext } from '@/contexts/ros/RosContext';
import { useSubscriber } from '@/hooks/ros/useSubscriber';
import { useTopics } from '@/hooks/ros/useTopics';

function IMUCard() {
  const { connectionState } = useRosContext();
  const [viewMode, setViewMode] = useState<ViewMode>('digital');
  const [selectedTopic, setSelectedTopic] =
    useState<string>(DEFAULT_PLOT_TOPIC);

  // Fetch available topics dynamically
  const { topics } = useTopics();

  // Filter topics to only show IMU topics
  const imuTopics = useMemo(() => filterImuTopics(topics), [topics]);

  // Auto-select first available IMU topic
  useEffect(() => {
    if (imuTopics.length > 0 && !imuTopics.includes(selectedTopic)) {
      setSelectedTopic(imuTopics[0]);
    }
  }, [imuTopics, selectedTopic]);

  const { data: imuRawData, loading } = useSubscriber<ImuMessage>({
    topic: selectedTopic,
    messageType: 'sensor_msgs/msg/Imu',
    throttleRate: 100, // 10 Hz
    enabled: connectionState === 'connected',
  });

  // Transform ROS message format to IMUData format
  const imuData = useMemo(() => {
    if (!imuRawData) return null;
    return transformImuMessage(imuRawData);
  }, [imuRawData]);

  const isConnected = connectionState === 'connected';

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
          IMU
        </h3>
        <div className="flex items-center gap-2">
          <IMUTopicSelector
            selectedTopic={selectedTopic}
            onTopicChange={setSelectedTopic}
            topics={imuTopics}
            isConnected={isConnected}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode((prev) => (prev === 'digital' ? 'plot' : 'digital'))
            }
            className="h-8 px-2 border-2 border-[#4A4A4A] hover:border-[#6A6A6A] hover:bg-[#1A1A1A] focus-visible:border-amber-600 transition-all"
          >
            {viewMode === 'digital' ? (
              <BarChart3 className="h-3 w-3" />
            ) : (
              <Grid3x3 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      <IMUStatusMessage
        isConnected={isConnected}
        loading={loading}
        hasData={!!imuData}
      />
      {isConnected && !loading && imuData && (
        <>
          {viewMode === 'digital' ? (
            <DigitalView data={imuData} />
          ) : (
            <PlotView data={imuData} />
          )}
        </>
      )}
    </div>
  );
}

export default IMUCard;
