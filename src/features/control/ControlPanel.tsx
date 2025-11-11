import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Maximize2,
  Square,
} from 'lucide-react';

import { useControl } from './ControlContext';
import type { ControlPanelProps } from './definitions';
import TopicSelector from './TopicSelector';
import VelocitySliders from './VelocitySliders';

import { Button } from '@/components/ui/button';

function ControlPanel({ onTogglePilotMode }: ControlPanelProps) {
  const {
    controlState,
    updateLinearVelocity,
    updateAngularVelocity,
    updateSelectedTopic,
    handleDirectionPress,
    handleEmergencyStop,
  } = useControl();

  return (
    <div className="bg-card border border-border rounded-sm p-4 h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-mono font-semibold text-foreground tracking-wider">
          CONTROL PANEL
        </h3>
        <TopicSelector
          selectedTopic={controlState.selectedTopic}
          onTopicChange={updateSelectedTopic}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onTogglePilotMode}
        className="h-7 w-35 px-2 text-xs font-mono mb-3 flex-shrink-0 border-2 border-[#4A4A4A] hover:border-[#6A6A6A] hover:bg-[#1A1A1A] focus-visible:border-amber-600 transition-all"
      >
        <Maximize2 className="h-3 w-3 mr-1.5" />
        PILOT MODE
      </Button>

      {/* Gamepad Controls + Vertical Sliders */}
      <div className="flex items-center justify-center gap-6 flex-1 min-h-0">
        {/* Gamepad */}
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] select-none">
            {/* Top - Forward */}
            <Button
              className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-[#4A4A4A] hover:border-[#6A6A6A] hover:bg-[#1A1A1A] active:bg-emerald-500/20 active:border-emerald-500 transition-all"
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
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-[#4A4A4A] hover:border-[#6A6A6A] hover:bg-[#1A1A1A] active:bg-emerald-500/20 active:border-emerald-500 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Center - Emergency Stop */}
            <Button
              variant="destructive"
              onClick={handleEmergencyStop}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-800 active:to-red-900 border-2 border-red-500 flex flex-col gap-0 transition-all duration-300"
            >
              <Square className="w-6 h-6" strokeWidth={3} />
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
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-[#4A4A4A] hover:border-[#6A6A6A] hover:bg-[#1A1A1A] active:bg-emerald-500/20 active:border-emerald-500 transition-all"
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
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 border-2 border-[#4A4A4A] hover:border-[#6A6A6A] hover:bg-[#1A1A1A] active:bg-emerald-500/20 active:border-emerald-500 transition-all"
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
          onLinearChange={updateLinearVelocity}
          onAngularChange={updateAngularVelocity}
        />
      </div>
    </div>
  );
}

export default ControlPanel;
