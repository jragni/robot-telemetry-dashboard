import { useRef, useEffect, useCallback } from 'react';
import { normalizeHeading } from '@/utils/normalizeHeading';
import type { WireframeViewProps } from '@/features/workspace/types/ImuPanel.types';

const CUBE_VERTICES: readonly [number, number, number][] = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
];

const CUBE_EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7],
];

/** WireframeView
 * @description Renders a 3D wireframe rectangular prism that rotates based on
 *  roll, pitch, and yaw. Simple perspective projection with accent-colored
 *  edges. Submarine depth gauge crossed with aircraft attitude reference.
 * @param roll - Roll angle in degrees.
 * @param pitch - Pitch angle in degrees.
 * @param yaw - Yaw heading in degrees.
 */
export function WireframeView({ roll, pitch, yaw }: WireframeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef({
    accent: 'oklch(0.70 0.20 230)',
    border: 'rgba(255,255,255,0.15)',
    muted: 'oklch(0.57 0.02 260)',
  });
  const colorsResolved = useRef(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!colorsResolved.current) {
      const styles = getComputedStyle(canvas);
      colorsRef.current = {
        accent: styles.getPropertyValue('--color-accent') || colorsRef.current.accent,
        border: styles.getPropertyValue('--color-border') || colorsRef.current.border,
        muted: styles.getPropertyValue('--color-text-muted') || colorsRef.current.muted,
      };
      colorsResolved.current = true;
    }
    const c = colorsRef.current;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const scale = size * 0.22;
    const focalLength = 4;

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
    ctx.arc(cx, cy, size / 2 - 4, 0, Math.PI * 2);
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
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fillStyle = c.muted;
    ctx.fill();
  }, [roll, pitch, yaw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const heading = normalizeHeading(yaw);

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="rounded-full"
        aria-label={`3D wireframe: roll ${String(Math.round(roll * 10) / 10)}°, pitch ${String(Math.round(pitch * 10) / 10)}°, heading ${String(Math.round(heading))}°`}
      />
      <dl className="flex gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-muted">R</dt>
          <dd className="text-accent tabular-nums">{String(Math.round(roll * 10) / 10)}°</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-muted">P</dt>
          <dd className="text-accent tabular-nums">{String(Math.round(pitch * 10) / 10)}°</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="font-sans text-text-muted">Y</dt>
          <dd className="text-accent tabular-nums">{String(Math.round(heading))}°</dd>
        </div>
      </dl>
    </div>
  );
}
