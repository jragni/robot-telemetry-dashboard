import { useEffect } from 'react';

import { useLidarCanvas } from '@/features/telemetry/lidar/hooks/useLidarCanvas';
import { useLidarData } from '@/features/telemetry/lidar/hooks/useLidarData';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MINIMAP_SIZE = 200;
// Fixed scale for the minimap — no zoom controls. 30 px/m gives a wider field
// of view than the default 50 px/m, which is better for the small canvas.
const MINIMAP_SCALE = 30;

// ---------------------------------------------------------------------------
// PilotLidarMinimap
// ---------------------------------------------------------------------------

interface PilotLidarMinimapProps {
  robotId: string;
}

/**
 * Compact 200x200 LiDAR canvas overlay for the pilot mode layout.
 *
 * - Uses the same useLidarData + useLidarCanvas pipeline as LidarWidget.
 * - Fixed scale (no zoom controls) to keep the minimap uncluttered.
 * - Semi-transparent dark background for HUD readability.
 */
export function PilotLidarMinimap({ robotId }: PilotLidarMinimapProps) {
  const { data } = useLidarData(robotId);

  const { canvasRef, setScale } = useLidarCanvas(
    data,
    MINIMAP_SIZE,
    MINIMAP_SIZE
  );

  // Apply the fixed minimap scale once on mount.
  // useLidarCanvas defaults to 50 px/m; override to 30 px/m for the wider
  // field of view that suits the small minimap canvas.
  useEffect(() => {
    setScale(MINIMAP_SCALE);
    // setScale is stable (from useState) — safe to omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      data-testid="pilot-lidar-minimap"
      className="overflow-hidden rounded border border-border/40 bg-black/70 backdrop-blur-sm"
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
    >
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        aria-label="LiDAR minimap"
        className="block"
      />
    </div>
  );
}
