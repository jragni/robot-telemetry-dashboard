'use client';

import MobilePilotControls from './MobilePilotControls';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';
import PingDisplay from '@/components/dashboard/PingDisplay';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RobotConnection } from '../dashboard/definitions';

interface PilotMobileViewProps {
  orientation: 'landscape' | 'portrait';
  selectedConnection?: RobotConnection | null;
  exitPilotMode?: () => void;
}

export default function PilotMobileView({
  orientation,
  selectedConnection,
  exitPilotMode,
}: PilotMobileViewProps) {
  return (
    <div className="md:hidden">
      {/* Exit button - Mobile */}
      <Button
        aria-label="Exit pilot mode"
        className="absolute top-2 left-2 z-50 w-10 h-10 p-0 bg-red-600/80 hover:bg-red-700/90 text-white rounded-full shadow-lg"
        onClick={exitPilotMode}
        variant="ghost"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Top status bar - Mobile */}
      <div className={`absolute ${orientation === 'landscape' ? 'top-1 left-16 right-1 mobile-safe-area-top mobile-safe-area-right' : 'top-2 left-20 right-2 mobile-safe-area-top mobile-safe-area-right'
      } bg-black/60 backdrop-blur-sm px-3 py-2 rounded text-white text-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              selectedConnection?.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span className="text-xs truncate max-w-[120px]">
              {selectedConnection?.status === 'connected'
                ? selectedConnection.name
                : 'No Connection'
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <PingDisplay compact ping={selectedConnection?.ping} showLabel />
          </div>
        </div>
      </div>

      {/* LiDAR Display - No Overlap Positioning */}
      <div className={`absolute ${
        orientation === 'landscape'
          ? 'top-20 right-4 w-48'
          : 'top-10 right-2 w-32'
      } bg-black/40 backdrop-blur-sm rounded-lg p-2`}>
        <div className={orientation === 'landscape' ? 'h-32' : 'h-32'}>
          <LaserScanVisualization />
        </div>
      </div>

      {/* Mobile Controls - Positioned based on orientation */}
      <div className={`absolute ${
        orientation === 'landscape'
          ? 'bottom-4 left-4 w-36'
          : 'bottom-4 left-1/2 transform -translate-x-1/2 w-40'
      } ${
        orientation === 'portrait'
          ? 'bg-black/30'
          : 'bg-black/40'
      } backdrop-blur-sm rounded-lg`}>
        <MobilePilotControls orientation={orientation} />
      </div>
    </div>
  );
}