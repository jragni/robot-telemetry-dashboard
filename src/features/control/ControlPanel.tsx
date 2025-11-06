import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, X } from 'lucide-react';
import { useState } from 'react';

import { VELOCITY_LIMITS } from './constants';
import type { Direction, ControlState } from './definitions';

import { Button } from '@/components/ui/button';

function ControlPanel() {
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
    <div className="bg-slate-900 border border-slate-700 rounded-sm p-3">
      <h3 className="text-xs font-mono text-slate-400 tracking-wider mb-3">
        CONTROL
      </h3>

      {/* Gamepad-style Controls */}
      <div className="mb-3">
        <div className="relative w-[140px] h-[140px] mx-auto">
          {/* Top - Forward */}
          <Button
            className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-green-500/20 border-slate-600"
            onMouseDown={() => handleDirectionPress('forward')}
            onMouseLeave={() => handleDirectionPress('stop')}
            onMouseUp={() => handleDirectionPress('stop')}
            onTouchEnd={() => handleDirectionPress('stop')}
            onTouchStart={() => handleDirectionPress('forward')}
            size="icon-sm"
            variant="outline"
          >
            <ArrowUp className="w-5 h-5 text-slate-400" />
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
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-green-500/20 border-slate-600"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Button>

          {/* Center - Emergency Stop */}
          <Button
            variant="destructive"
            onClick={handleEmergencyStop}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-800 active:to-red-900 border-2 border-red-500 shadow-lg shadow-red-900/50 flex flex-col gap-0"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-green-500/20 border-slate-600"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
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
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-slate-800 hover:bg-slate-700 active:bg-green-500/20 border-slate-600"
          >
            <ArrowDown className="w-5 h-5 text-slate-400" />
          </Button>

          {/* Status indicator */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors ${controlState.isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-700'}`}
            />
            <span className="text-[10px] font-mono text-slate-500">
              {controlState.isActive ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Velocity Sliders */}
      <div className="space-y-2 mt-6">
        {/* Linear Velocity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="linear-velocity"
              className="text-[10px] font-mono text-slate-400"
            >
              LINEAR
            </label>
            <span className="text-[10px] font-mono text-slate-300">
              {controlState.linearVelocity.toFixed(2)} m/s
            </span>
          </div>
          <input
            id="linear-velocity"
            type="range"
            min={VELOCITY_LIMITS.linear.min}
            max={VELOCITY_LIMITS.linear.max}
            step="0.1"
            value={controlState.linearVelocity}
            onChange={(e) =>
              setControlState({
                ...controlState,
                linearVelocity: parseFloat(e.target.value),
              })
            }
            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-green-500"
          />
        </div>

        {/* Angular Velocity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label
              htmlFor="angular-velocity"
              className="text-[10px] font-mono text-slate-400"
            >
              ANGULAR
            </label>
            <span className="text-[10px] font-mono text-slate-300">
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
            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-green-500"
          />
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
