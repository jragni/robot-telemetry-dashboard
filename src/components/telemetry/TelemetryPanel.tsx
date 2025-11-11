import { useMemo, useState } from 'react';

import { DEFAULT_PLOT_TOPIC } from './imu/constants';
import { DEFAULT_LIDAR_TOPIC } from './lidar/constants';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ImuMessage, LaserScanMessage } from '@/contexts/ros/definitions';
import { useRosContext } from '@/contexts/ros/RosContext';
import { useSubscriber } from '@/hooks/ros/useSubscriber';
import { useTopics } from '@/hooks/ros/useTopics';

function TelemetryPanel() {
  const { connectionState } = useRosContext();
  const [lidarTopic, setLidarTopic] = useState(DEFAULT_LIDAR_TOPIC);
  const [imuTopic, setImuTopic] = useState(DEFAULT_PLOT_TOPIC);

  // Fetch available topics dynamically
  const { topics } = useTopics();

  // Filter topics by type
  const lidarTopics = useMemo(() => {
    return topics
      .filter((topic) => topic.type === 'sensor_msgs/msg/LaserScan')
      .map((topic) => topic.name);
  }, [topics]);

  const imuTopics = useMemo(() => {
    return topics
      .filter((topic) => topic.type === 'sensor_msgs/msg/Imu')
      .map((topic) => topic.name);
  }, [topics]);

  // Subscribe to LIDAR data
  const { data: lidarData, loading: lidarLoading } =
    useSubscriber<LaserScanMessage>({
      topic: lidarTopic,
      messageType: 'sensor_msgs/msg/LaserScan',
      throttleRate: 200,
      enabled: connectionState === 'connected',
    });

  // Subscribe to IMU data
  const { data: imuRawData, loading: imuLoading } = useSubscriber<ImuMessage>({
    topic: imuTopic,
    messageType: 'sensor_msgs/msg/Imu',
    throttleRate: 100,
    enabled: connectionState === 'connected',
  });

  // Transform IMU data
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
    <div className="space-y-3">
      {/* Lidar Visualization */}
      <div className="bg-card border border-border rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
            LIDAR
          </h3>
          <Select
            value={lidarTopic}
            onValueChange={setLidarTopic}
            disabled={!isConnected || lidarTopics.length === 0}
          >
            <SelectTrigger size="sm" className="text-xs font-mono w-auto">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white dark:bg-slate-900 dark:text-slate-100">
              {lidarTopics.length > 0 ? (
                lidarTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No LaserScan topics
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="relative aspect-square bg-secondary border border-border rounded-sm overflow-hidden">
          {!isConnected ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs font-mono text-muted-foreground text-center">
                Not connected to robot
              </p>
            </div>
          ) : lidarLoading || !lidarData ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-xs font-mono text-muted-foreground">
                Waiting for LIDAR data...
              </p>
            </div>
          ) : (
            <>
              {/* Lidar polar grid */}
              <svg className="w-full h-full" viewBox="-100 -100 200 200">
                {/* Grid circles */}
                {[25, 50, 75, 100].map((r) => (
                  <circle
                    key={r}
                    cx="0"
                    cy="0"
                    r={r}
                    fill="none"
                    stroke="rgb(51 65 85)"
                    strokeWidth="0.5"
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
                      stroke="rgb(51 65 85)"
                      strokeWidth="0.5"
                    />
                  );
                })}

                {/* Lidar points */}
                {lidarData.ranges.map((range, i) => {
                  const angle =
                    lidarData.angle_min +
                    i * lidarData.angle_increment -
                    Math.PI / 2;
                  const normalizedRange = (range / lidarData.range_max) * 100;
                  const x = Math.cos(angle) * normalizedRange;
                  const y = Math.sin(angle) * normalizedRange;

                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="0.8"
                      fill="rgb(34 197 94)"
                      opacity="0.6"
                    />
                  );
                })}

                {/* Robot center */}
                <circle cx="0" cy="0" r="3" fill="rgb(239 68 68)" />
              </svg>

              <div className="absolute bottom-2 left-2 text-xs font-mono text-muted-foreground">
                Range: {lidarData.range_max.toFixed(1)}m
              </div>
            </>
          )}
        </div>
      </div>

      {/* IMU Data */}
      <div className="bg-card border border-border rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
            IMU
          </h3>
          <Select
            value={imuTopic}
            onValueChange={setImuTopic}
            disabled={!isConnected || imuTopics.length === 0}
          >
            <SelectTrigger size="sm" className="text-xs font-mono w-auto">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent className="bg-black text-white dark:bg-slate-900 dark:text-slate-100">
              {imuTopics.length > 0 ? (
                imuTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No IMU topics
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {!isConnected ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs font-mono text-muted-foreground text-center">
              Not connected to robot
            </p>
          </div>
        ) : imuLoading || !imuData ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs font-mono text-muted-foreground">
              Waiting for IMU data...
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs font-mono">
            {/* Angular Velocity */}
            <div>
              <span className="text-muted-foreground">
                ANGULAR VELOCITY (rad/s)
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div className="bg-secondary p-2 rounded-sm">
                  <span className="text-muted-foreground">X</span>
                  <p className="text-foreground font-bold">
                    {imuData.angularVelocity.x.toFixed(3)}
                  </p>
                </div>
                <div className="bg-secondary p-2 rounded-sm">
                  <span className="text-muted-foreground">Y</span>
                  <p className="text-foreground font-bold">
                    {imuData.angularVelocity.y.toFixed(3)}
                  </p>
                </div>
                <div className="bg-secondary p-2 rounded-sm">
                  <span className="text-muted-foreground">Z</span>
                  <p className="text-foreground font-bold">
                    {imuData.angularVelocity.z.toFixed(3)}
                  </p>
                </div>
              </div>
            </div>

            {/* Linear Acceleration */}
            <div>
              <span className="text-muted-foreground">
                LINEAR ACCELERATION (m/s²)
              </span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <div className="bg-secondary p-2 rounded-sm">
                  <span className="text-muted-foreground">X</span>
                  <p className="text-foreground font-bold">
                    {imuData.linearAcceleration.x.toFixed(2)}
                  </p>
                </div>
                <div className="bg-secondary p-2 rounded-sm">
                  <span className="text-muted-foreground">Y</span>
                  <p className="text-foreground font-bold">
                    {imuData.linearAcceleration.y.toFixed(2)}
                  </p>
                </div>
                <div className="bg-secondary p-2 rounded-sm">
                  <span className="text-muted-foreground">Z</span>
                  <p className="text-foreground font-bold">
                    {imuData.linearAcceleration.z.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TelemetryPanel;
