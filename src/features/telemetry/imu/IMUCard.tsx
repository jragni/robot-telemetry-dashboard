import { BarChart3, Grid3x3 } from 'lucide-react';
import { useState } from 'react';

import { MOCK_IMU, PLOT_TOPIC_OPTIONS } from './constants';
import type { ViewMode, PlotMetric } from './definitions';
import IMUPlot from './IMUPlot';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function IMUCard() {
  const [viewMode, setViewMode] = useState<ViewMode>('digital');
  const [selectedTopic, setSelectedTopic] = useState(PLOT_TOPIC_OPTIONS[0]);
  const [plotMetric, setPlotMetric] = useState<PlotMetric>('angularVelocity');

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
          IMU
        </h3>
        <div className="flex items-center gap-2">
          <Select onValueChange={setSelectedTopic} value={selectedTopic}>
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

      {viewMode === 'digital' ? (
        <div className="space-y-3 text-xs font-mono flex-1 flex flex-col justify-center">
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
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="mb-2">
            <Select
              value={plotMetric}
              onValueChange={(value) => setPlotMetric(value as PlotMetric)}
            >
              <SelectTrigger size="sm" className="w-full text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black text-white dark:bg-slate-900 dark:text-slate-100">
                <SelectItem value="angularVelocity" className="text-xs">
                  Angular Velocity (rad/s)
                </SelectItem>
                <SelectItem value="linearAcceleration" className="text-xs">
                  Linear Acceleration (m/s²)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-h-0">
            <IMUPlot data={MOCK_IMU} metric={plotMetric} />
          </div>
        </div>
      )}
    </div>
  );
}

export default IMUCard;
