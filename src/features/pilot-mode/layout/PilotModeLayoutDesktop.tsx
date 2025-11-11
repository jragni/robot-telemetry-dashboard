import { Minimize2 } from 'lucide-react';

import type { PilotModeLayoutProps } from '../definitions';
import PilotControlPanel from '../PilotControlPanel';
import PilotVideoFeed from '../PilotVideoFeed';

import { PilotLidarMinimap } from './lidar';

import { Button } from '@/components/ui/button';

function PilotModeLayoutDesktop({ onExitPilotMode }: PilotModeLayoutProps) {
  return (
    <div className="hidden md:block h-full w-full relative">
      <PilotVideoFeed />

      {/* LIDAR minimap - top right corner */}
      <div className="absolute top-4 right-4 w-52 h-52 lg:w-60 lg:h-60 z-10 rounded border border-border overflow-hidden shadow-lg">
        <PilotLidarMinimap />
      </div>

      {/* Control Panel - bottom center */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <PilotControlPanel />
      </div>

      {/* Exit button - bottom right */}
      <div className="absolute bottom-6 right-6 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={onExitPilotMode}
          className="h-10 px-4 text-xs font-mono bg-card/90 backdrop-blur-sm hover:bg-card"
        >
          <Minimize2 className="h-4 w-4 mr-2" />
          EXIT
        </Button>
      </div>
    </div>
  );
}

export default PilotModeLayoutDesktop;
