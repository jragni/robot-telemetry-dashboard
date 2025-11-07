import { useState } from 'react';

import {
  DEFAULT_PLOT_TOPIC,
  MOCK_IMU,
  PLOT_TOPIC_OPTIONS,
} from './imu/constants';
import {
  DEFAULT_LIDAR_TOPIC,
  LIDAR_TOPIC_OPTIONS,
  MOCK_LIDAR,
} from './lidar/constants';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function TelemetryPanel() {
  const [lidarTopic, setLidarTopic] = useState(DEFAULT_LIDAR_TOPIC);
  const [plotTopic, setPlotTopic] = useState(DEFAULT_PLOT_TOPIC);

  return (
    <div className="space-y-3">
      {/* Lidar Visualization */}
      <div className="bg-card border border-border rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
            LIDAR
          </h3>
          <Select value={lidarTopic} onValueChange={setLidarTopic}>
            <SelectTrigger size="sm" className="text-xs font-mono w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black text-white dark:bg-slate-900 dark:text-slate-100">
              {LIDAR_TOPIC_OPTIONS.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative aspect-square bg-secondary border border-border rounded-sm overflow-hidden">
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
            {MOCK_LIDAR.ranges.map((range, i) => {
              const angle =
                MOCK_LIDAR.angleMin +
                i * MOCK_LIDAR.angleIncrement -
                Math.PI / 2;
              const normalizedRange = (range / MOCK_LIDAR.rangeMax) * 100;
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
            Range: {MOCK_LIDAR.rangeMax.toFixed(1)}m
          </div>
        </div>
      </div>

      {/* IMU Data */}
      <div className="bg-card border border-border rounded-sm p-4">
        <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider mb-3">
          IMU
        </h3>

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
                  {MOCK_IMU.angularVelocity.x.toFixed(3)}
                </p>
              </div>
              <div className="bg-secondary p-2 rounded-sm">
                <span className="text-muted-foreground">Y</span>
                <p className="text-foreground font-bold">
                  {MOCK_IMU.angularVelocity.y.toFixed(3)}
                </p>
              </div>
              <div className="bg-secondary p-2 rounded-sm">
                <span className="text-muted-foreground">Z</span>
                <p className="text-foreground font-bold">
                  {MOCK_IMU.angularVelocity.z.toFixed(3)}
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
                  {MOCK_IMU.linearAcceleration.x.toFixed(2)}
                </p>
              </div>
              <div className="bg-secondary p-2 rounded-sm">
                <span className="text-muted-foreground">Y</span>
                <p className="text-foreground font-bold">
                  {MOCK_IMU.linearAcceleration.y.toFixed(2)}
                </p>
              </div>
              <div className="bg-secondary p-2 rounded-sm">
                <span className="text-muted-foreground">Z</span>
                <p className="text-foreground font-bold">
                  {MOCK_IMU.linearAcceleration.z.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Plotter */}
      <div className="bg-card border border-border rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
            TOPIC PLOT
          </h3>
          <Select value={plotTopic} onValueChange={setPlotTopic}>
            <SelectTrigger size="sm" className="text-xs font-mono w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black text-white dark:bg-slate-900 dark:text-slate-100">
              {PLOT_TOPIC_OPTIONS.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative h-32 bg-secondary border border-border rounded-sm">
          {/* Simple grid */}
          <div className="absolute inset-0 flex flex-col justify-between p-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-border" />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs font-mono text-muted-foreground">
              NO DATA - CONNECT TO ROS
            </p>
          </div>

          <div className="absolute bottom-2 left-2 text-xs font-mono text-muted-foreground">
            Topic: {plotTopic}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelemetryPanel;
