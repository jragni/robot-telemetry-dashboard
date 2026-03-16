import type { RobotStatus } from '../fleet.types';

import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { VideoFeed } from '@/features/webrtc/components/VideoFeed';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MiniPilotViewProps {
  status: RobotStatus;
  /** True when this cell is the currently selected robot for full control. */
  isSelected?: boolean;
  /** Called when the user clicks to select this robot. */
  onSelect?: (robotId: string) => void;
}

// ---------------------------------------------------------------------------
// MiniPilotView
// ---------------------------------------------------------------------------

/**
 * Compact pilot view cell for one robot inside the SplitPilotGrid.
 *
 * Contains:
 * - Video feed (fills the cell)
 * - Robot name label (top-left overlay)
 * - Connection status dot (top-right overlay)
 * - Click-to-select interaction with selected highlight border
 */
export function MiniPilotView({
  status,
  isSelected = false,
  onSelect,
}: MiniPilotViewProps) {
  const { robot, rosState } = status;

  function handleClick() {
    onSelect?.(robot.id);
  }

  return (
    <div
      data-testid={`mini-pilot-${robot.id}`}
      role="button"
      tabIndex={0}
      aria-label={`Select ${robot.name} for control`}
      aria-pressed={isSelected}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'relative overflow-hidden rounded-sm border cursor-pointer transition-all select-none',
        'aspect-video',
        isSelected
          ? 'border-primary ring-2 ring-primary/50 shadow-[0_0_12px_rgba(var(--color-primary)/0.25)]'
          : 'border-border/60 hover:border-primary/40'
      )}
    >
      {/* Video feed fills the cell */}
      <VideoFeed
        robotId={robot.id}
        showStatusOverlay={false}
        className="absolute inset-0 h-full w-full"
      />

      {/* Dark gradient overlay at the bottom for legibility */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      {/* Top-left: Robot name */}
      <div className="absolute left-2 top-2 z-10">
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-foreground backdrop-blur-sm">
          {robot.name}
        </span>
      </div>

      {/* Top-right: Connection status dot */}
      <div className="absolute right-2 top-2 z-10">
        <StatusIndicator state={rosState} />
      </div>

      {/* Selected indicator overlay */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-primary rounded-sm" />
      )}
    </div>
  );
}
