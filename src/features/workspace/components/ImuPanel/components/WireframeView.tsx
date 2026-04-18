import { useCallback, useEffect, useRef } from 'react';

import { useCanvasColors } from '@/hooks';
import { formatDegrees, normalizeHeading } from '@/utils';
import { WIREFRAME_COLOR_FALLBACKS, WIREFRAME_TOKEN_MAP } from '@/features/workspace/constants';
import type { WireframeViewProps } from '@/features/workspace/types/ImuPanel.types';

import {
  CANVAS_BORDER_INSET,
  CUBE_EDGES,
  CUBE_VERTICES,
  WIREFRAME_CANVAS_SIZE,
  WIREFRAME_CENTER_DOT_RADIUS,
  WIREFRAME_FOCAL_LENGTH,
  WIREFRAME_SCALE_FACTOR,
} from '../constants';

/** WireframeView
 * @description Renders a 3D wireframe rectangular prism that rotates based on
 *  roll, pitch, and yaw. Simple perspective projection with accent-colored
 *  edges. Submarine depth gauge crossed with aircraft attitude reference.
 * @prop roll - Roll angle in degrees.
 * @prop pitch - Pitch angle in degrees.
 * @prop yaw - Yaw heading in degrees.
 */
export function WireframeView({ roll, pitch, yaw }: WireframeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { colorsRef, themeVersion, resolveColors } = useCanvasColors(
    WIREFRAME_COLOR_FALLBACKS,
    WIREFRAME_TOKEN_MAP,
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    resolveColors();
    const c = colorsRef.current;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const scale = size * WIREFRAME_SCALE_FACTOR;
    const focalLength = WIREFRAME_FOCAL_LENGTH;

    ctx.clearRect(0, 0, size, size);

    const rollRad = (roll * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const yawRad = (yaw * Math.PI) / 180;

    const cosR = Math.cos(rollRad);
    const sinR = Math.sin(rollRad);
    const cosP = Math.cos(pitchRad);
    const sinP = Math.sin(pitchRad);
    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);

    function project(x: number, y: number, z: number): [number, number] {
      let rx = cosY * x - sinY * z;
      let rz = sinY * x + cosY * z;
      const ry1 = cosP * y - sinP * rz;
      const rz1 = sinP * y + cosP * rz;
      const rx1 = cosR * rx - sinR * ry1;
      const ry2 = sinR * rx + cosR * ry1;
      rx = rx1;
      rz = rz1;

      const perspectiveScale = focalLength / (focalLength + rz);
      return [cx + rx * scale * perspectiveScale, cy + ry2 * scale * perspectiveScale];
    }

    const projected = CUBE_VERTICES.map(([x, y, z]) => project(x, y, z));

    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 - CANVAS_BORDER_INSET, 0, Math.PI * 2);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.5;
    for (const [a, b] of CUBE_EDGES) {
      const pa = projected[a];
      const pb = projected[b];
      if (!pa || !pb) continue;
      ctx.beginPath();
      ctx.moveTo(pa[0], pa[1]);
      ctx.lineTo(pb[0], pb[1]);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, WIREFRAME_CENTER_DOT_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = c.muted;
    ctx.fill();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- themeVersion forces redraw on theme change
  }, [roll, pitch, yaw, resolveColors, themeVersion, colorsRef]);

  useEffect(() => {
    draw();
  }, [draw]);

  const heading = normalizeHeading(yaw);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={WIREFRAME_CANVAS_SIZE}
        height={WIREFRAME_CANVAS_SIZE}
        className="rounded-full"
        aria-label={`3D wireframe: roll ${formatDegrees(roll)}°, pitch ${formatDegrees(pitch)}°, heading ${String(Math.round(heading))}°`}
      />
      <dl className="flex gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-secondary">R</dt>
          <dd className="text-text-primary tabular-nums">{formatDegrees(roll)}°</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-secondary">P</dt>
          <dd className="text-text-primary tabular-nums">{formatDegrees(pitch)}°</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-secondary">Y</dt>
          <dd className="text-text-primary tabular-nums">{String(Math.round(heading))}°</dd>
        </div>
      </dl>
    </div>
  );
}
