import { useState } from 'react';

import { usePilotMode } from '../hooks/usePilotMode';

import { PilotExitButton } from './PilotExitButton';
import { PilotHud } from './PilotHud';
import type { PilotMobileLayoutProps } from './PilotMobileLayout.types';

import { ControlPad } from '@/components/shared/ControlPad';
import { VideoFeed } from '@/components/shared/VideoFeed';

// ---------------------------------------------------------------------------
// PilotMobileLayout
// ---------------------------------------------------------------------------

/**
 * Touch-optimised pilot layout for mobile viewports (< 768px).
 *
 * Layout:
 * - Video fills the top 60% of the screen.
 * - Control pad occupies the bottom 40%.
 * - HUD badges overlay the video area.
 * - LiDAR minimap is hidden (too small to be useful at mobile sizes).
 * - Swiping up on the video area toggles HUD visibility.
 */
export function PilotMobileLayout({ robotId }: PilotMobileLayoutProps) {
  const { hudData, exit } = usePilotMode(robotId);
  const [hudVisible, setHudVisible] = useState(true);

  // ---- Swipe-up detection ----
  let touchStartY = 0;

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY = e.touches[0]?.clientY ?? 0;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const touchEndY = e.changedTouches[0]?.clientY ?? 0;
    const deltaY = touchStartY - touchEndY;
    // Swipe up (finger moving up = decreasing Y) with at least 40px travel
    if (deltaY > 40) {
      setHudVisible((v) => !v);
    }
  }

  return (
    <div
      data-testid="pilot-mobile-layout"
      className="flex h-screen w-screen flex-col overflow-hidden bg-black"
      style={{ userSelect: 'none' }}
    >
      {/* Video section — 60% height */}
      <div
        className="relative flex-none overflow-hidden"
        style={{ height: '60dvh' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <VideoFeed
          robotId={robotId}
          showStatusOverlay={false}
          className="h-full w-full"
        />

        {/* HUD overlay within the video section */}
        {hudVisible && <PilotHud hudData={hudData} onExit={exit} />}

        {/* Exit button — always visible regardless of HUD toggle */}
        <div className="absolute right-3 top-3 z-20">
          <PilotExitButton onExit={exit} />
        </div>

        {/* Swipe hint */}
        {hudVisible && (
          <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
              swipe up to toggle hud
            </span>
          </div>
        )}
      </div>

      {/* Control section — 40% height */}
      <div
        className="flex flex-1 items-center justify-center bg-background/95 px-6 py-4"
        data-testid="pilot-mobile-controls"
      >
        <div className="w-full max-w-xs">
          <ControlPad robotId={robotId} />
        </div>
      </div>
    </div>
  );
}
