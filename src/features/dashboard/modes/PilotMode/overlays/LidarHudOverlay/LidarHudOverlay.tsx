import { useState, useEffect } from 'react';

import type { LidarHudOverlayProps } from './LidarHudOverlay.types';

const LS_KEY = 'rdt-lidar-hud-visible';

export function LidarHudOverlay({
  robotId: _robotId,
  isVisible,
  onToggleVisibility: _onToggleVisibility,
}: LidarHudOverlayProps) {
  const [expanded, setExpanded] = useState(false);

  // Persist isVisible preference to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY, String(isVisible));
  }, [isVisible]);

  if (!isVisible) return null;

  if (expanded) {
    return (
      <div
        data-testid="lidar-hud-expanded"
        role="button"
        tabIndex={0}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={() => setExpanded(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setExpanded(false);
        }}
      >
        <div className="relative h-[80vmin] w-[80vmin] rounded border border-blue-500 bg-black">
          <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            LiDAR full view — Phase 5 widget
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="lidar-hud-overlay"
      data-position="bottom-left"
      role="button"
      tabIndex={0}
      className="absolute bottom-4 left-4 z-20 h-[20%] w-[20%] cursor-pointer rounded border border-blue-500 bg-black/60"
      onClick={() => setExpanded(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setExpanded(true);
      }}
    >
      <p className="flex h-full items-center justify-center text-xs text-slate-400">
        LiDAR HUD
      </p>
    </div>
  );
}
