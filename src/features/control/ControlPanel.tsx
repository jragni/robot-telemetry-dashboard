import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Maximize2,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { VELOCITY_LIMITS, AVAILABLE_CONTROL_TOPICS } from './constants';
import type { Direction, ControlState, ControlPanelProps } from './definitions';
import TopicSelector from './TopicSelector';
import VelocitySliders from './VelocitySliders';

import { Button } from '@/components/ui/button';

function ControlPanel({ onTogglePilotMode }: ControlPanelProps) {
  const [controlState, setControlState] = useState<ControlState>({
    linearVelocity: VELOCITY_LIMITS.linear.default,
    angularVelocity: VELOCITY_LIMITS.angular.default,
    isActive: false,
    selectedTopic: AVAILABLE_CONTROL_TOPICS[0].value, // Default to first topic
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
        <TopicSelector
          selectedTopic={controlState.selectedTopic}
          onTopicChange={(topic) =>
            setControlState({ ...controlState, selectedTopic: topic })
          }
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onTogglePilotMode}
        className="h-7 w-35 px-2 text-xs font-mono mb-3"
      >
        <Maximize2 className="h-3 w-3 mr-1.5" />
        PILOT MODE
      </Button>

      {/* Gamepad Controls + Vertical Sliders */}
      <div className="flex items-center justify-center gap-6">
        {/* Gamepad */}
        <div className="flex flex-col items-center">
          <div className="relative w-[120px] h-[120px]">
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
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-800 active:to-red-900 border-2 border-red-500 flex flex-col gap-0 transition-all duration-300"
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
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-1.5 mt-2">
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors ${controlState.isActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`}
            />
            <span className="text-[10px] font-mono text-muted-foreground">
              {controlState.isActive ? 'ACTIVE' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* Vertical Velocity Sliders */}
        <VelocitySliders
          linearVelocity={controlState.linearVelocity}
          angularVelocity={controlState.angularVelocity}
          onLinearChange={(value) =>
            setControlState({ ...controlState, linearVelocity: value })
          }
          onAngularChange={(value) =>
            setControlState({ ...controlState, angularVelocity: value })
          }
        />
      </div>
    </div>
  );
}

export default ControlPanel;
