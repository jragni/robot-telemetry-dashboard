import { useRef, useEffect, useState, useCallback } from 'react';
import { useThemeChange } from '@/hooks/useThemeChange';
import {
  COMPASS_STRIP_WIDTH,
  COMPASS_STRIP_HEIGHT,
  COMPASS_TICK_MAJOR_INTERVAL,
  COMPASS_TICK_MINOR_INTERVAL,
  COMPASS_CARDINALS,
  COMPASS_DEGREES_VISIBLE,
} from '../constants';
import type { PilotCompassProps } from '../types/PilotView.types';

/** PilotCompass
 * @description Renders a horizontal compass heading strip using Canvas 2D.
 *  Tick marks slide horizontally based on IMU yaw angle. Major ticks every
 *  30 degrees, minor every 10. Cardinal labels (N/E/S/W) rendered inline.
 *  Gradient fade at left/right edges. No background — ticks float over
 *  the camera feed.
 * @param heading - Current heading in degrees (0-360).
 */
export function PilotCompass({ heading }: PilotCompassProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [themeVersion, setThemeVersion] = useState(0);

  const colorsRef = useRef({
    accent: 'oklch(0.70 0.20 230)',
    textMuted: 'oklch(0.57 0.02 260)',
    tickMinor: 'rgba(255,255,255,0.15)',
    tickMajor: 'rgba(255,255,255,0.35)',
  });
  const colorsResolved = useRef(false);

  useThemeChange(() => {
    colorsResolved.current = false;
    setThemeVersion((v) => v + 1);
  });

  const resolveColors = useCallback(() => {
    if (colorsResolved.current) return;
    const style = getComputedStyle(document.documentElement);
    colorsRef.current = {
      accent: style.getPropertyValue('--color-accent').trim() || colorsRef.current.accent,
      textMuted: style.getPropertyValue('--color-text-muted').trim() || colorsRef.current.textMuted,
      tickMinor: style.getPropertyValue('--color-border').trim() || colorsRef.current.tickMinor,
      tickMajor: style.getPropertyValue('--color-text-secondary').trim() || colorsRef.current.tickMajor,
    };
    colorsResolved.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resolveColors();
    const colors = colorsRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = COMPASS_STRIP_WIDTH;
    const h = COMPASS_STRIP_HEIGHT;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const pxPerDeg = w / COMPASS_DEGREES_VISIBLE;

    const cardinalSet = new Map(COMPASS_CARDINALS.map((c) => [c.deg, c.label]));

    for (let deg = 0; deg < 360; deg += COMPASS_TICK_MINOR_INTERVAL) {
      let offset = deg - heading;
      if (offset > 180) offset -= 360;
      if (offset < -180) offset += 360;

      const x = centerX + offset * pxPerDeg;
      if (x < -10 || x > w + 10) continue;

      const isMajor = deg % COMPASS_TICK_MAJOR_INTERVAL === 0;
      const cardinal = cardinalSet.get(deg);

      ctx.beginPath();
      ctx.strokeStyle = isMajor ? colors.tickMajor : colors.tickMinor;
      ctx.lineWidth = isMajor ? 1.5 : 0.5;
      const tickHeight = isMajor ? 12 : 6;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, tickHeight);
      ctx.stroke();

      if (cardinal) {
        ctx.font = '600 12px Exo, sans-serif';
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'center';
        ctx.fillText(cardinal, x, 24);
      } else if (isMajor) {
        ctx.font = '400 9px "Roboto Mono", monospace';
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'center';
        ctx.fillText(`${String(deg)}°`, x, 22);
      }
    }

    // Center pointer triangle
    ctx.beginPath();
    ctx.fillStyle = colors.accent;
    ctx.moveTo(centerX - 5, 0);
    ctx.lineTo(centerX + 5, 0);
    ctx.lineTo(centerX, 6);
    ctx.closePath();
    ctx.fill();

    // Fade edges with gradient
    const fadeWidth = 30;
    const fadeLeft = ctx.createLinearGradient(0, 0, fadeWidth, 0);
    fadeLeft.addColorStop(0, 'rgba(0,0,0,1)');
    fadeLeft.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = fadeLeft;
    ctx.fillRect(0, 0, fadeWidth, h);

    const fadeRight = ctx.createLinearGradient(w - fadeWidth, 0, w, 0);
    fadeRight.addColorStop(0, 'rgba(0,0,0,0)');
    fadeRight.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = fadeRight;
    ctx.fillRect(w - fadeWidth, 0, fadeWidth, h);
    ctx.globalCompositeOperation = 'source-over';

  }, [heading, themeVersion, resolveColors]);

  const headingNormalized = ((heading % 360) + 360) % 360;

  return (
    <div className="flex flex-col items-center gap-0.5 pointer-events-auto">
      <canvas
        ref={canvasRef}
        width={COMPASS_STRIP_WIDTH}
        height={COMPASS_STRIP_HEIGHT}
        style={{ width: COMPASS_STRIP_WIDTH, height: COMPASS_STRIP_HEIGHT }}
        aria-label={`Heading: ${headingNormalized.toFixed(0)} degrees`}
      />
      <span className="font-mono text-xl font-semibold text-accent tabular-nums">
        {headingNormalized.toFixed(0)}°
      </span>
    </div>
  );
}
