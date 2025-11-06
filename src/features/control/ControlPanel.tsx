import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Maximize2,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { VELOCITY_LIMITS } from './constants';
import type { Direction, ControlState } from './definitions';

import { Button } from '@/components/ui/button';

interface ControlPanelProps {
  onTogglePilotMode?: () => void;
}

function ControlPanel({ onTogglePilotMode }: ControlPanelProps) {
  const [controlState, setControlState] = useState<ControlState>({
    linearVelocity: VELOCITY_LIMITS.linear.default,
    angularVelocity: VELOCITY_LIMITS.angular.default,
    isActive: false,
  });

  const handleDirectionPress = (direction: Direction) => {
    // TODO: Send command to robot via ROS
    setControlState({ ...controlState, isActive: direction !== 'stop' });
  };

  const handleEmergencyStop = () => {
    // TODO: Send emergency stop command to robot via ROS
    setControlState({ ...controlState, isActive: false });
  };

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
          CONTROL PANEL
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePilotMode}
          className="h-7 px-2 text-xs font-mono"
        >
          <Maximize2 className="h-3 w-3 mr-1.5" />
          PILOT MODE
        </Button>
      </div>

      {/* Gamepad-style Controls */}
      <div className="mb-4">
        <div className="relative w-[120px] h-[120px] mx-auto">
          {/* Top - Forward */}
          <Button
            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 active:bg-green-500/20"
            onMouseDown={() => handleDirectionPress('forward')}
            onMouseLeave={() => handleDirectionPress('stop')}
            onMouseUp={() => handleDirectionPress('stop')}
            onTouchEnd={() => handleDirectionPress('stop')}
            onTouchStart={() => handleDirectionPress('forward')}
            size="icon-sm"
            variant="outline"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>

          {/* Left */}
          <Button
            variant="outline"
            size="icon-sm"
            onMouseDown={() => handleDirectionPress('left')}
            onMouseUp={() => handleDirectionPress('stop')}
            onMouseLeave={() => handleDirectionPress('stop')}
            onTouchStart={() => handleDirectionPress('left')}
            onTouchEnd={() => handleDirectionPress('stop')}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 active:bg-green-500/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* Center - Emergency Stop */}
          <Button
            variant="destructive"
            onClick={handleEmergencyStop}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-800 active:to-red-900 border-2 border-red-500 shadow-lg shadow-red-900/50 flex flex-col gap-0 transition-all duration-300"
          >
            <X className="w-6 h-6" strokeWidth={3} />
            <span className="text-[8px] font-bold tracking-wider">STOP</span>
          </Button>

          {/* Right */}
          <Button
            variant="outline"
            size="icon-sm"
            onMouseDown={() => handleDirectionPress('right')}
            onMouseUp={() => handleDirectionPress('stop')}
            onMouseLeave={() => handleDirectionPress('stop')}
            onTouchStart={() => handleDirectionPress('right')}
            onTouchEnd={() => handleDirectionPress('stop')}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 active:bg-green-500/20"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>

          {/* Bottom - Backward */}
          <Button
            variant="outline"
            size="icon-sm"
            onMouseDown={() => handleDirectionPress('backward')}
            onMouseUp={() => handleDirectionPress('stop')}
            onMouseLeave={() => handleDirectionPress('stop')}
            onTouchStart={() => handleDirectionPress('backward')}
            onTouchEnd={() => handleDirectionPress('stop')}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 active:bg-green-500/20"
          >
            <ArrowDown className="w-5 h-5" />
          </Button>

          {/* Status indicator */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors ${controlState.isActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`}
            />
            <span className="text-[10px] font-mono text-muted-foreground">
              {controlState.isActive ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Velocity Sliders */}
      <div className="space-y-3 mt-4">
        {/* Linear Velocity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="linear-velocity"
              className="text-[10px] font-mono text-muted-foreground"
            >
              LINEAR
            </label>
            <span className="text-[10px] font-mono text-foreground">
              {controlState.linearVelocity.toFixed(2)} m/s
            </span>
          </div>
          <input
            id="linear-velocity"
            type="range"
            min={VELOCITY_LIMITS.linear.min}
            max={VELOCITY_LIMITS.linear.max}
            step="0.01"
            value={controlState.linearVelocity}
            onChange={(e) =>
              setControlState({
                ...controlState,
                linearVelocity: parseFloat(e.target.value),
              })
            }
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-green-500 touch-none"
            style={{
              background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${(controlState.linearVelocity / VELOCITY_LIMITS.linear.max) * 100}%, hsl(var(--muted)) ${(controlState.linearVelocity / VELOCITY_LIMITS.linear.max) * 100}%, hsl(var(--muted)) 100%)`,
            }}
          />
        </div>

        {/* Angular Velocity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="angular-velocity"
              className="text-[10px] font-mono text-muted-foreground"
            >
              ANGULAR
            </label>
            <span className="text-[10px] font-mono text-foreground">
              {controlState.angularVelocity.toFixed(2)} rad/s
            </span>
          </div>
          <input
            id="angular-velocity"
            type="range"
            min={VELOCITY_LIMITS.angular.min}
            max={VELOCITY_LIMITS.angular.max}
            step="0.1"
            value={controlState.angularVelocity}
            onChange={(e) =>
              setControlState({
                ...controlState,
                angularVelocity: parseFloat(e.target.value),
              })
            }
            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-green-500 touch-none"
            style={{
              background: `linear-gradient(to right, rgb(34 197 94) 0%, rgb(34 197 94) ${(controlState.angularVelocity / VELOCITY_LIMITS.angular.max) * 100}%, hsl(var(--muted)) ${(controlState.angularVelocity / VELOCITY_LIMITS.angular.max) * 100}%, hsl(var(--muted)) 100%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
