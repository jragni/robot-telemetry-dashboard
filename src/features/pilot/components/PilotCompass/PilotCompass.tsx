import { useRef, useEffect } from 'react';

import { useCanvasColors } from '@/hooks/useCanvasColors';
import { useResponsiveSize } from '@/hooks/useResponsiveSize';
import { COMPASS_CARDINALS } from '@/constants/canvas';

import {
  COMPASS_COLOR_FALLBACKS,
  COMPASS_DEGREES_VISIBLE,
  COMPASS_FADE_WIDTH,
  COMPASS_POINTER_HALF_WIDTH,
  COMPASS_POINTER_HEIGHT,
  COMPASS_STRIP_HEIGHT,
  COMPASS_TICK_HEIGHT_MAJOR,
  COMPASS_TICK_HEIGHT_MINOR,
  COMPASS_TICK_MAJOR_INTERVAL,
  COMPASS_TICK_MINOR_INTERVAL,
  COMPASS_TOKEN_MAP,
} from './constants';
import { clampCompassWidth } from './helpers';
import type { PilotCompassProps } from './PilotCompass.types';

/** PilotCompass
 * @description Renders a horizontal compass heading strip using Canvas 2D.
 *  Tick marks slide horizontally based on IMU yaw angle. Major ticks every
 *  30 degrees, minor every 10. Cardinal labels (N/E/S/W) rendered inline.
 *  Gradient fade at left/right edges. No background — ticks float over
 *  the camera feed.
 * @prop heading - Current heading in degrees (0-360).
 */
export function PilotCompass({ heading }: PilotCompassProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stripWidth = useResponsiveSize(clampCompassWidth);
  const { colorsRef, themeVersion, resolveColors } = useCanvasColors(
    COMPASS_COLOR_FALLBACKS,
    COMPASS_TOKEN_MAP,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resolveColors();
    const colors = colorsRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = stripWidth;
    const h = COMPASS_STRIP_HEIGHT;

    const scaledW = w * dpr;
    const scaledH = h * dpr;
    if (canvas.width !== scaledW) canvas.width = scaledW;
    if (canvas.height !== scaledH) canvas.height = scaledH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      const tickHeight = isMajor ? COMPASS_TICK_HEIGHT_MAJOR : COMPASS_TICK_HEIGHT_MINOR;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, tickHeight);
      ctx.stroke();

      if (cardinal) {
        ctx.font = '600 12px Exo, sans-serif';
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'center';
        ctx.fillText(cardinal, x, 24);
      } else if (isMajor) {
        ctx.font = '400 12px "Roboto Mono", monospace';
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'center';
        ctx.fillText(`${String(deg)}°`, x, 22);
      }
    }

    // Center pointer triangle
    ctx.beginPath();
    ctx.fillStyle = colors.accent;
    ctx.moveTo(centerX - COMPASS_POINTER_HALF_WIDTH, 0);
    ctx.lineTo(centerX + COMPASS_POINTER_HALF_WIDTH, 0);
    ctx.lineTo(centerX, COMPASS_POINTER_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Fade edges — uses rgba for Canvas 2D compositing (cannot use CSS tokens)
    const fadeLeft = ctx.createLinearGradient(0, 0, COMPASS_FADE_WIDTH, 0);
    fadeLeft.addColorStop(0, 'rgba(0,0,0,1)');
    fadeLeft.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = fadeLeft;
    ctx.fillRect(0, 0, COMPASS_FADE_WIDTH, h);

    const fadeRight = ctx.createLinearGradient(w - COMPASS_FADE_WIDTH, 0, w, 0);
    fadeRight.addColorStop(0, 'rgba(0,0,0,0)');
    fadeRight.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = fadeRight;
    ctx.fillRect(w - COMPASS_FADE_WIDTH, 0, COMPASS_FADE_WIDTH, h);
    ctx.globalCompositeOperation = 'source-over';
  }, [heading, stripWidth, themeVersion, resolveColors, colorsRef]);

  const headingNormalized = ((heading % 360) + 360) % 360;

  return (
    <div className="flex flex-col items-center gap-0.5 pointer-events-auto bg-surface-base/60 backdrop-blur-sm rounded-sm px-2 py-1">
      <canvas
        ref={canvasRef}
        width={stripWidth}
        height={COMPASS_STRIP_HEIGHT}
        style={{ width: stripWidth, height: COMPASS_STRIP_HEIGHT }}
        aria-label={`Heading: ${headingNormalized.toFixed(0)} degrees`}
      />
      <span className="font-mono text-xl font-semibold text-accent tabular-nums">
        {headingNormalized.toFixed(0)}°
      </span>
    </div>
  );
}
