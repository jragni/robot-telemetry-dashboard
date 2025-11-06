import { useEffect } from 'react';

import PilotConnectionStatus from './PilotConnectionStatus';
import PilotControlPanel from './PilotControlPanel';
import PilotLidarMinimap from './PilotLidarMinimap';
import PilotVideoFeed from './PilotVideoFeed';

interface PilotModeLayoutProps {
  isConnected: boolean;
  onExitPilotMode: () => void;
}

function PilotModeLayout({
  isConnected,
  onExitPilotMode,
}: PilotModeLayoutProps) {
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
      <PilotConnectionStatus isConnected={isConnected} />
      {/* Minimap Lidar - Top Left */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 z-10 rounded-sm shadow-2xl">
        <PilotLidarMinimap />
      </div>
      {/* Control Panel Overlay - Bottom Center */}
      <div className="absolute bottom-8 md:bottom-4 left-1/2 -translate-x-1/2 z-10 rounded-sm shadow-2xl">
        <PilotControlPanel />
      </div>
    </main>
  );
}

export default PilotModeLayout;
