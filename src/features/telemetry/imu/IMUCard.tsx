import { BarChart3, Grid3x3 } from 'lucide-react';
import { useState } from 'react';

import { PLOT_TOPIC_OPTIONS } from './constants';
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
import { useRosContext } from '@/features/ros/RosContext';
import { useSubscriber } from '@/features/ros/useSubscriber';
import type { ImuMessage } from '@/types/ros';

function IMUCard() {
  const { connectionState } = useRosContext();
  const [viewMode, setViewMode] = useState<ViewMode>('digital');
  const [selectedTopic, setSelectedTopic] = useState<string>('/imu/data');

  const { data: imuData, loading } = useSubscriber<ImuMessage>({
    topic: selectedTopic,
    messageType: 'sensor_msgs/msg/Imu',
    throttleRate: 100, // 10 Hz
    enabled: connectionState === 'connected',
  });

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
            disabled={!isConnected}
          >
            <SelectTrigger size="sm" className="w-fit text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black text-white dark:bg-slate-900 dark:text-slate-100">
              {PLOT_TOPIC_OPTIONS.map((topic) => (
                <SelectItem key={topic} value={topic} className="text-xs">
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode((prev) => (prev === 'digital' ? 'plot' : 'digital'))
            }
            className="h-8 px-2"
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
