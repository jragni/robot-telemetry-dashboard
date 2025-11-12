import { Minimize2 } from 'lucide-react';

import type { PilotModeLayoutProps } from '../definitions';
import PilotControlPanel from '../PilotControlPanel';
import PilotVideoFeed from '../PilotVideoFeed';

import { PilotLidarMinimap } from './lidar';

import { Button } from '@/components/ui/button';

function PilotModeLayoutMobile({ onExitPilotMode }: PilotModeLayoutProps) {
  return (
    <div className="fixed inset-0 md:hidden overflow-hidden touch-none select-none overscroll-none z-50">
      {/* Video background layer */}
      <div className="absolute inset-0 z-0">
        <PilotVideoFeed />
      </div>

      {/* LIDAR - floating bottom left in portrait, above controls in landscape */}
      <div className="fixed bottom-6 left-3 landscape:left-auto landscape:right-3 landscape:bottom-40 w-32 h-32 z-[60] overflow-hidden shadow-lg">
        <PilotLidarMinimap />
      </div>

      {/* Controls - floating bottom right */}
      <div className="fixed bottom-6 right-3 z-[60]">
        <PilotControlPanel />
      </div>

      {/* Exit button - floating top left */}
      <div className="fixed top-2 left-2 z-[70]">
        <Button
          variant="outline"
          size="sm"
          onClick={onExitPilotMode}
          className="h-9 w-9 p-0 bg-card/90 backdrop-blur-sm hover:bg-card"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default PilotModeLayoutMobile;
