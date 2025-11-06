import { useState } from 'react';

import {
  DEFAULT_LIDAR_TOPIC,
  DEFAULT_PLOT_TOPIC,
  LIDAR_TOPIC_OPTIONS,
  MOCK_IMU,
  MOCK_LIDAR,
  PLOT_TOPIC_OPTIONS,
} from './constants';

function TelemetryPanel() {
  const [lidarTopic, setLidarTopic] = useState(DEFAULT_LIDAR_TOPIC);
  const [plotTopic, setPlotTopic] = useState(DEFAULT_PLOT_TOPIC);

  return (
    <div className="space-y-3">
      {/* Lidar Visualization */}
      <div className="bg-slate-900 border border-slate-700 rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-slate-400 tracking-wider">
            LIDAR
          </h3>
          <select
            value={lidarTopic}
            onChange={(e) => setLidarTopic(e.target.value)}
            className="text-xs font-mono bg-slate-800 border border-slate-600 text-slate-300 px-2 py-1 rounded-sm"
          >
            {LIDAR_TOPIC_OPTIONS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="relative aspect-square bg-slate-950 border border-slate-800 rounded-sm overflow-hidden">
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

          <div className="absolute bottom-2 left-2 text-xs font-mono text-slate-500">
            Range: {MOCK_LIDAR.rangeMax.toFixed(1)}m
          </div>
        </div>
      </div>

      {/* IMU Data */}
      <div className="bg-slate-900 border border-slate-700 rounded-sm p-4">
        <h3 className="text-xs font-mono text-slate-400 tracking-wider mb-3">
          IMU
        </h3>

        <div className="space-y-3 text-xs font-mono">
          {/* Angular Velocity */}
          <div>
            <span className="text-slate-500">ANGULAR VELOCITY (rad/s)</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="bg-slate-800 p-2 rounded-sm">
                <span className="text-slate-400">X</span>
                <p className="text-slate-100 font-bold">
                  {MOCK_IMU.angularVelocity.x.toFixed(3)}
                </p>
              </div>
              <div className="bg-slate-800 p-2 rounded-sm">
                <span className="text-slate-400">Y</span>
                <p className="text-slate-100 font-bold">
                  {MOCK_IMU.angularVelocity.y.toFixed(3)}
                </p>
              </div>
              <div className="bg-slate-800 p-2 rounded-sm">
                <span className="text-slate-400">Z</span>
                <p className="text-slate-100 font-bold">
                  {MOCK_IMU.angularVelocity.z.toFixed(3)}
                </p>
              </div>
            </div>
          </div>

          {/* Linear Acceleration */}
          <div>
            <span className="text-slate-500">LINEAR ACCELERATION (m/s²)</span>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="bg-slate-800 p-2 rounded-sm">
                <span className="text-slate-400">X</span>
                <p className="text-slate-100 font-bold">
                  {MOCK_IMU.linearAcceleration.x.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-800 p-2 rounded-sm">
                <span className="text-slate-400">Y</span>
                <p className="text-slate-100 font-bold">
                  {MOCK_IMU.linearAcceleration.y.toFixed(2)}
                </p>
              </div>
              <div className="bg-slate-800 p-2 rounded-sm">
                <span className="text-slate-400">Z</span>
                <p className="text-slate-100 font-bold">
                  {MOCK_IMU.linearAcceleration.z.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Plotter */}
      <div className="bg-slate-900 border border-slate-700 rounded-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono text-slate-400 tracking-wider">
            TOPIC PLOT
          </h3>
          <select
            value={plotTopic}
            onChange={(e) => setPlotTopic(e.target.value)}
            className="text-xs font-mono bg-slate-800 border border-slate-600 text-slate-300 px-2 py-1 rounded-sm"
          >
            {PLOT_TOPIC_OPTIONS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div className="relative h-32 bg-slate-950 border border-slate-800 rounded-sm">
          {/* Simple grid */}
          <div className="absolute inset-0 flex flex-col justify-between p-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-b border-slate-800" />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs font-mono text-slate-600">
              NO DATA - CONNECT TO ROS
            </p>
          </div>

          <div className="absolute bottom-2 left-2 text-xs font-mono text-slate-500">
            Topic: {plotTopic}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelemetryPanel;
