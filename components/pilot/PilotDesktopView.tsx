import { RobotConnection } from '../dashboard/definitions';

import ControlPanel from '@/components/controlsection/ControlPanel';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';
import PingDisplay from '@/components/dashboard/PingDisplay';

interface PilotDesktopViewProps {
  selectedConnection: RobotConnection | null
}

export default function PilotDesktopView({ selectedConnection }: PilotDesktopViewProps) {
  return (
    <div className="hidden md:block">
      {/* LiDAR HUD - Top Right (Independent) */}
      <div className="absolute top-4 right-4 w-80 h-60 bg-black/40 backdrop-blur-sm rounded-lg">
        <div className="p-2 h-full">
          <LaserScanVisualization />
        </div>
      </div>

      {/* Control HUD - Bottom Center (Independent) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-80 bg-black/40 backdrop-blur-sm rounded-lg">
        <div className="p-3">
          <ControlPanel />
        </div>
      </div>

      {/* Connection status indicator */}
      <div className="absolute top-4 left-24 bg-black/50 backdrop-blur-sm px-3 py-2 rounded text-white text-sm">
        <div className="flex items-center gap-3">
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
          <PingDisplay ping={selectedConnection?.ping} showLabel />
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
  );
}