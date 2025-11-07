import { useState } from 'react';

import {
  DEFAULT_LIDAR_TOPIC,
  LIDAR_TOPIC_OPTIONS,
  MOCK_LIDAR,
} from './constants';
import type { LidarCardProps } from './definitions';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function LidarCard({ compact = false }: LidarCardProps) {
  const [lidarTopic, setLidarTopic] = useState(DEFAULT_LIDAR_TOPIC);

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col">
      {!compact && (
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
      )}

      <div
        className={`relative ${compact ? 'h-full' : 'flex-1'} bg-secondary border border-border rounded-sm overflow-hidden`}
      >
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
              MOCK_LIDAR.angleMin + i * MOCK_LIDAR.angleIncrement - Math.PI / 2;
            const normalizedRange = (range / MOCK_LIDAR.rangeMax) * 100;
            const x = Math.cos(angle) * normalizedRange;
            const y = Math.sin(angle) * normalizedRange;

            // Distance-based coloring: red (near) -> yellow -> green (far)
            const distanceRatio = range / MOCK_LIDAR.rangeMax;
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

        {/* Compact mode overlays */}
        {compact && (
          <>
            <div className="absolute top-2 left-2 right-2 z-10">
              <Select value={lidarTopic} onValueChange={setLidarTopic}>
                <SelectTrigger
                  size="sm"
                  className="text-xs font-mono w-auto bg-card/90 backdrop-blur-sm"
                >
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
            <div className="absolute bottom-2 left-2 text-xs font-mono text-muted-foreground bg-card/90 backdrop-blur-sm px-2 py-1 rounded-sm">
              Range: {MOCK_LIDAR.rangeMax.toFixed(1)}m
            </div>
          </>
        )}

        {/* Normal mode info */}
        {!compact && (
          <>
            <div className="absolute bottom-2 left-2 text-xs font-mono text-muted-foreground">
              Range: {MOCK_LIDAR.rangeMax.toFixed(1)}m
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
