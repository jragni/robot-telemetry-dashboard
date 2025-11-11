import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface LidarZoomControlsProps {
  viewRange: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isConnected: boolean;
  compact?: boolean;
}

export function LidarZoomControls({
  viewRange,
  onZoomIn,
  onZoomOut,
  canZoomIn,
  canZoomOut,
  isConnected,
  compact = false,
}: LidarZoomControlsProps) {
  const containerClassName = compact
    ? 'flex items-center gap-1 border-2 border-[#4A4A4A] rounded-md bg-card/90 backdrop-blur-sm h-8'
    : 'flex items-center gap-1 border-2 border-[#4A4A4A] rounded-md bg-background h-8';

  return (
    <div className={containerClassName}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomIn}
        disabled={!isConnected || !canZoomIn}
        className="h-8 w-8 hover:bg-[#1A1A1A] focus-visible:border-amber-600 transition-all"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <div className="text-[13px] font-mono text-gray-900 dark:text-[#E8E8E8] px-2 min-w-[45px] text-center">
        {viewRange.toFixed(0)}m
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomOut}
        disabled={!isConnected || !canZoomOut}
        className="h-8 w-8 hover:bg-[#1A1A1A] focus-visible:border-amber-600 transition-all"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}
