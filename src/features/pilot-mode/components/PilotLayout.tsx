import { usePilotMode } from '../hooks/usePilotMode';

import { PilotExitButton } from './PilotExitButton';
import { PilotHud } from './PilotHud';
import type { PilotLayoutProps } from './PilotLayout.types';
import { PilotLidarMinimap } from './PilotLidarMinimap';

import { ControlPad } from '@/components/shared/ControlPad';
import { VideoFeed } from '@/components/shared/VideoFeed';

// ---------------------------------------------------------------------------
// PilotLayout
// ---------------------------------------------------------------------------

/**
 * Desktop FPOV pilot layout.
 *
 * Full-viewport immersive view:
 * - Video feed fills the entire background.
 * - HUD elements are absolutely positioned over the video.
 * - Top-left: Connection status badges (ROS + WebRTC).
 * - Top-center: Heading indicator (when IMU data is available).
 * - Top-right: Exit button.
 * - Bottom-center: Control pad.
 * - Bottom-left: Velocity readout (+ battery above it when available).
 * - Bottom-right: LiDAR minimap (200x200).
 */
export function PilotLayout({ robotId }: PilotLayoutProps) {
  const { hudData, exit } = usePilotMode(robotId);

  return (
    <div
      data-testid="pilot-layout"
      className="relative h-screen w-screen overflow-hidden bg-black"
      // Prevent text selection during control interactions
      style={{ userSelect: 'none' }}
    >
      {/* Background: full-viewport video feed */}
      <div className="absolute inset-0">
        <VideoFeed
          robotId={robotId}
          showStatusOverlay={false}
          className="h-full w-full"
        />
      </div>

      {/* HUD overlay layer: connection badges, velocity, heading, battery */}
      <PilotHud hudData={hudData} onExit={exit} />

      {/* Top-right: Exit button */}
      <div className="absolute right-3 top-3 z-20">
        <PilotExitButton onExit={exit} />
      </div>

      {/* Bottom-center: Control pad */}
      <div
        data-testid="pilot-control-pad"
        className="absolute bottom-6 left-1/2 z-20 w-48 -translate-x-1/2"
      >
        <ControlPad robotId={robotId} />
      </div>

      {/* Bottom-right: LiDAR minimap */}
      <div className="absolute bottom-6 right-3 z-20">
        <PilotLidarMinimap robotId={robotId} />
      </div>
    </div>
  );
}
