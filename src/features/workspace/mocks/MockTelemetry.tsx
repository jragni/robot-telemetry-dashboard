import { useRef, useEffect, useCallback } from 'react';

/**
 *
 */
export function MockTelemetry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const accentColor =
      getComputedStyle(canvas).getPropertyValue('--color-accent') ||
      'oklch(0.70 0.20 230)';
    const borderColor =
      getComputedStyle(canvas).getPropertyValue('--color-border') ||
      'rgba(255,255,255,0.15)';

    // Grid lines
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 0.5;
    for (let y = 0; y < h; y += h / 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Mock sine wave (linear.x)
    ctx.beginPath();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    for (let x = 0; x < w; x++) {
      const t = x / w;
      const y =
        h / 2 +
        Math.sin(t * Math.PI * 4) * (h * 0.3) +
        Math.sin(t * Math.PI * 7) * (h * 0.1);
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Second line (angular.z)
    ctx.beginPath();
    ctx.strokeStyle = 'oklch(0.70 0.19 155)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x++) {
      const t = x / w;
      const y = h / 2 + Math.cos(t * Math.PI * 3 + 1) * (h * 0.2);
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex gap-4 font-mono text-xs px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-px bg-accent inline-block" />
          <span className="text-text-muted">/odom linear.x</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-px bg-status-nominal inline-block" />
          <span className="text-text-muted">/odom angular.z</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={300}
        height={120}
        className="w-full flex-1"
      />
    </div>
  );
}
