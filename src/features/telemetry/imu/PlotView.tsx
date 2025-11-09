import { useState } from 'react';

import type { IMUData, PlotMetric } from './definitions';
import IMUPlot from './IMUPlot';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PlotView({ data }: { data: IMUData }) {
  const [plotMetric, setPlotMetric] = useState<PlotMetric>('angularVelocity');
  return (
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
        <IMUPlot data={data} metric={plotMetric} />
      </div>
    </div>
  );
}
