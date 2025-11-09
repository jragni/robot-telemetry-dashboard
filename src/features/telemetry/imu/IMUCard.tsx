import { BarChart3, Grid3x3 } from 'lucide-react';
import { useState } from 'react';

import { MOCK_IMU, PLOT_TOPIC_OPTIONS } from './constants';
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

function IMUCard() {
  const [viewMode, setViewMode] = useState<ViewMode>('digital');
  const [selectedTopic, setSelectedTopic] = useState<string>(
    PLOT_TOPIC_OPTIONS[0]
  );

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
          IMU
        </h3>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(val) => setSelectedTopic(val)}
            value={selectedTopic}
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
      {viewMode === 'digital' ? (
        <DigitalView data={MOCK_IMU} />
      ) : (
        <PlotView data={MOCK_IMU} />
      )}
    </div>
  );
}

export default IMUCard;
