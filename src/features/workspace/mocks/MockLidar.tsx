import { useRef, useEffect, useCallback } from 'react';

/** MockLidar
 * @description Renders a canvas-based mock LiDAR visualization with range rings
 *  and simulated scan points.
 */
export function MockLidar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 10;

    ctx.clearRect(0, 0, size, size);

    const borderColor =
      getComputedStyle(canvas).getPropertyValue('--color-border') ||
      'rgba(255,255,255,0.15)';
    const accentColor =
      getComputedStyle(canvas).getPropertyValue('--color-accent') ||
      'oklch(0.70 0.20 230)';

    // Range rings
    for (let r = maxR / 3; r <= maxR; r += maxR / 3) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Cross
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxR);
    ctx.lineTo(cx, cy + maxR);
    ctx.moveTo(cx - maxR, cy);
    ctx.lineTo(cx + maxR, cy);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Mock scan points (room-like shape)
    ctx.fillStyle = accentColor;
    for (let angle = 0; angle < 360; angle += 2) {
      const rad = (angle * Math.PI) / 180;
      let dist = maxR * 0.7;
      if (angle > 30 && angle < 60) dist = maxR * 0.4;
      if (angle > 150 && angle < 210) dist = maxR * 0.85;
      if (angle > 270 && angle < 320) dist = maxR * 0.5;
      dist += (Math.random() - 0.5) * 8;

      const x = cx + Math.cos(rad) * dist;
      const y = cy + Math.sin(rad) * dist;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Robot position (center triangle)
    ctx.beginPath();
    ctx.moveTo(cx, cy - 5);
    ctx.lineTo(cx - 4, cy + 3);
    ctx.lineTo(cx + 4, cy + 3);
    ctx.closePath();
    ctx.fillStyle = 'oklch(0.93 0.01 260)';
    ctx.fill();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  return <canvas ref={canvasRef} width={180} height={180} />;
}
