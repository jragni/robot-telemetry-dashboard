import { Minimize2 } from 'lucide-react';
import { useEffect } from 'react';

import type { PilotModeLayoutProps } from './definitions';
import PilotControlPanel from './PilotControlPanel';
import PilotLidarMinimap from './PilotLidarMinimap';
import PilotVideoFeed from './PilotVideoFeed';

import { Button } from '@/components/ui/button';

function PilotModeLayout({ onExitPilotMode }: PilotModeLayoutProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExitPilotMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitPilotMode]);

  return (
    <main className="h-full w-full relative overflow-hidden">
      <PilotVideoFeed />

      {/* Minimap Lidar - Top Left */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 z-10 rounded-sm">
        <PilotLidarMinimap />
      </div>

      {/* Control Panel Overlay - Bottom Center */}
      <div className="absolute bottom-8 md:bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-sm">
        <PilotControlPanel />
      </div>

      {/* Exit Pilot Mode Button - Bottom Right */}
      <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20">
        <Button
          variant="outline"
          size="sm"
          onClick={onExitPilotMode}
          className="h-8 px-2 md:h-9 md:px-3 text-xs font-mono bg-card/90 backdrop-blur-sm hover:bg-card"
        >
          <Minimize2 className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1 md:mr-1.5" />
          <span className="hidden sm:inline">EXIT</span>
        </Button>
      </div>
    </main>
  );
}

export default PilotModeLayout;
