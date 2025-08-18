'use client';

import { usePilotMode } from './usePilotMode';
import { useConnection } from '@/components/dashboard/ConnectionProvider';
import PilotModeCamera from './PilotModeCamera';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';
import ControlPanel from '@/components/controlsection/ControlPanel';

export default function PilotMode() {
  const { isPilotMode, exitPilotMode, orientation, isFullscreen } = usePilotMode();
  const { selectedConnection } = useConnection();

  if (!isPilotMode) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-50 bg-black ${isFullscreen ? 'mobile-fullscreen' : ''} ${
      orientation === 'landscape' ? 'mobile-landscape-layout' : ''
    } mobile-safe-area`}>
      {/* Exit button - Top left, smaller */}
      <button
        onClick={exitPilotMode}
        className={`absolute z-50 bg-red-600/80 hover:bg-red-600 text-white px-2 py-1 rounded text-xs backdrop-blur-sm touch-manipulation min-h-[32px] min-w-[32px] flex items-center justify-center ${
          orientation === 'landscape' ? 'top-1 right-1 mobile-safe-area-top mobile-safe-area-left' : 'top-2 right-2 sm:top-4 sm:left-4 mobile-safe-area-top mobile-safe-area-left'
        }`}
      >
        <span className="hidden sm:inline text-xs">Exit</span>
        <span className="sm:hidden">✕</span>
      </button>

      {/* Fullscreen camera background */}
      <PilotModeCamera />

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Top status bar - Mobile */}
        <div className={`absolute ${
          orientation === 'landscape' ? 'top-1 left-8 right-1 mobile-safe-area-top mobile-safe-area-right' : 'top-2 left-12 right-2 mobile-safe-area-top mobile-safe-area-right'
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
          </div>
        </div>

        {/* Bottom HUD Panel - Mobile */}
        <div className={`absolute ${
          orientation === 'landscape' ? 'mobile-hud-bottom mobile-safe-area-bottom mobile-safe-area-right' : 'bottom-0 left-0 right-0 mobile-safe-area-bottom mobile-safe-area-left mobile-safe-area-right'
        }`}>
          {/* LiDAR Mini View */}
          <div className={`${orientation === 'landscape' ? 'p-1' : 'px-2 py-2'}`}>
            <div className={`${orientation === 'landscape' ? 'h-36' : 'h-40 w-[40%]'}`}>
              <LaserScanVisualization />
            </div>
          </div>

          {/* Controls */}
          <div className={`${orientation === 'landscape' ? 'p-1' : 'px-2 py-2'}`}>
            <ControlPanel />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* LiDAR HUD - Top Right */}
        <div className="absolute top-4 right-20 w-80 h-60">
          <div className="p-2 h-full">
            <LaserScanVisualization />
          </div>
        </div>

        {/* Control HUD - Bottom Left */}
        <div className="absolute bottom-4 left-4 w-72">
          <div className="p-3">
            <ControlPanel />
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="absolute top-4 left-20 bg-black/50 backdrop-blur-sm px-3 py-2 rounded text-white text-sm">
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

        {/* Keyboard shortcut help */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded text-white text-xs">
          <div>ESC - Exit</div>
        </div>
      </div>
    </div>
  );
}