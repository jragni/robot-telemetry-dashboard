'use client';

import { usePilotMode } from './usePilotMode';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import PilotModeCamera from './PilotModeCamera';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';
import ControlPanel from '@/components/controlsection/ControlPanel';

export default function PilotMode() {
  const { isPilotMode, exitPilotMode } = usePilotMode();
  const { selectedConnection } = useConnection();

  if (!isPilotMode) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Exit button */}
      <button
        className="absolute top-4 right-4 z-50 bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded text-sm backdrop-blur-sm"
        onClick={exitPilotMode}
      >
        Exit (Esc)
      </button>

      {/* Fullscreen camera background */}
      <PilotModeCamera />

      {/* LiDAR HUD - Top Right */}
      <div className="absolute top-4 right-20 w-80 h-60 bg-black/30 backdrop-blur-sm border border-gray-400/30 rounded">
        <div className="p-2 h-full">
          <LaserScanVisualization />
        </div>
      </div>

      {/* Control HUD - Bottom Left */}
      <div className="absolute bottom-4 left-4 w-72 bg-black/30 backdrop-blur-sm border border-gray-400/30 rounded">
        <div className="p-3">
          <ControlPanel />
        </div>
      </div>

      {/* Connection status indicator */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded text-white text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            selectedConnection?.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          <span>
            {selectedConnection?.status === 'connected'
              ? `Connected: ${selectedConnection.name}`
              : 'No Connection'
            }
          </span>
        </div>
      </div>

      {/* Crosshair overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 border-2 border-white/60 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white/80 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}