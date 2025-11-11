import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Square,
} from 'lucide-react';

import { useControl } from '../control/ControlContext';

import { Button } from '@/components/ui/button';

function PilotControlPanel() {
  const { handleDirectionPress, handleEmergencyStop } = useControl();

  return (
    <div className="relative min-w-[100px] min-h-[100px] md:min-w-[140px] md:min-h-[140px] mx-auto select-none">
      {/* Top - Forward */}
      <Button
        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 active:bg-green-500/20 transition-all duration-200"
        onMouseDown={() => handleDirectionPress('forward')}
        onMouseLeave={() => handleDirectionPress('stop')}
        onMouseUp={() => handleDirectionPress('stop')}
        onTouchEnd={() => handleDirectionPress('stop')}
        onTouchStart={() => handleDirectionPress('forward')}
        size="icon-sm"
        variant="outline"
      >
        <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
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
        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 active:bg-green-500/20 transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
      </Button>

      {/* Center - Emergency Stop */}
      <Button
        variant="destructive"
        onClick={handleEmergencyStop}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:from-red-800 active:to-red-900 border-2 border-red-500 shadow-red-900/50 flex flex-col gap-0 transition-all duration-300"
      >
        <Square className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
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
        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 active:bg-green-500/20 transition-all duration-200"
      >
        <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
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
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 active:bg-green-500/20 transition-all duration-200"
      >
        <ArrowDown className="w-4 h-4 md:w-5 md:h-5" />
      </Button>
    </div>
  );
}

export default PilotControlPanel;
