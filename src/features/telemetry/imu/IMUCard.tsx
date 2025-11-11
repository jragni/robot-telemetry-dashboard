import { BarChart3, Grid3x3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_PLOT_TOPIC } from './constants';
import type { ViewMode } from './definitions';
import { DigitalView } from './DigitalView';
import PlotView from './PlotView';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ImuMessage } from '@/features/ros/definitions';
import { useRosContext } from '@/features/ros/RosContext';
import { useSubscriber } from '@/features/ros/useSubscriber';
import { useTopics } from '@/features/ros/useTopics';

function IMUCard() {
  const { connectionState } = useRosContext();
  const [viewMode, setViewMode] = useState<ViewMode>('digital');
  const [selectedTopic, setSelectedTopic] =
    useState<string>(DEFAULT_PLOT_TOPIC);

  // Fetch available topics dynamically
  const { topics } = useTopics();

  // Filter topics to only show IMU topics
  const imuTopics = useMemo(() => {
    return topics
      .filter((topic) => topic.type === 'sensor_msgs/msg/Imu')
      .map((topic) => topic.name);
  }, [topics]);

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
    return {
      orientation: imuRawData.orientation,
      angularVelocity: imuRawData.angular_velocity,
      linearAcceleration: imuRawData.linear_acceleration,
    };
  }, [imuRawData]);

  const isConnected = connectionState === 'connected';

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
          IMU
        </h3>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(val) => setSelectedTopic(val)}
            value={selectedTopic}
            disabled={!isConnected || imuTopics.length === 0}
          >
            <SelectTrigger
              size="sm"
              className="w-fit text-[13px] font-mono bg-card text-gray-900 dark:text-[#E8E8E8] border-2 border-[#4A4A4A] hover:bg-[#1A1A1A] hover:border-[#6A6A6A] focus-visible:border-amber-600 transition-all"
            >
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-[#E8E8E8] border-2 border-gray-300 dark:border-[#5A5A5A] shadow-[0_4px_12px_rgba(0,0,0,0.3)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {imuTopics.length > 0 ? (
                imuTopics.map((topic) => (
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
                  No IMU topics found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
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
      {!isConnected ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs font-mono text-muted-foreground text-center">
            Not connected to robot
          </p>
        </div>
      ) : loading || !imuData ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs font-mono text-muted-foreground">
            Waiting for IMU data...
          </p>
        </div>
      ) : viewMode === 'digital' ? (
        <DigitalView data={imuData} />
      ) : (
        <PlotView data={imuData} />
      )}
    </div>
  );
}

export default IMUCard;
