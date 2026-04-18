import { useCallback, useEffect, useRef } from 'react';

import { useCanvasColors } from '@/hooks';
import { normalizeHeading } from '@/utils';
import { COMPASS_CARDINALS } from '@/constants/canvas';
import {
  COMPASS_HEADING_COLOR_FALLBACKS,
  COMPASS_HEADING_TOKEN_MAP,
} from '@/features/workspace/constants';
import type { CompassHeadingProps } from '@/features/workspace/types/ImuPanel.types';

import {
  CANVAS_BORDER_INSET,
  CANVAS_POINTER_HALF_WIDTH,
  CANVAS_POINTER_TOP_Y,
  COMPASS_HEADING_CANVAS_SIZE,
  COMPASS_HEADING_LABEL_OFFSET,
  COMPASS_HEADING_TICK_LEN_30,
  COMPASS_HEADING_TICK_LEN_CARDINAL,
  COMPASS_HEADING_TICK_LEN_MINOR,
} from '../constants';

/** CompassHeading
 * @description Renders a canvas-based compass dial showing yaw heading.
 *  Rotating dial with cardinal labels, tick marks, fixed pointer at top,
 *  and numeric heading readout in center.
 * @prop yaw - Yaw heading in degrees.
 */
export function CompassHeading({ yaw }: CompassHeadingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { colorsRef, themeVersion, resolveColors } = useCanvasColors(
    COMPASS_HEADING_COLOR_FALLBACKS,
    COMPASS_HEADING_TOKEN_MAP,
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
    const r = size / 2 - CANVAS_BORDER_INSET;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-yaw * Math.PI) / 180);

    for (let deg = 0; deg < 360; deg += 10) {
      const angleRad = ((deg - 90) * Math.PI) / 180;
      const isCardinal = deg % 90 === 0;
      const is30 = deg % 30 === 0;
      const tickLen = isCardinal
        ? COMPASS_HEADING_TICK_LEN_CARDINAL
        : is30
          ? COMPASS_HEADING_TICK_LEN_30
          : COMPASS_HEADING_TICK_LEN_MINOR;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angleRad) * r, Math.sin(angleRad) * r);
      ctx.lineTo(Math.cos(angleRad) * (r - tickLen), Math.sin(angleRad) * (r - tickLen));
      ctx.strokeStyle = isCardinal ? c.primary : c.muted;
      ctx.lineWidth = isCardinal ? 1.5 : 0.8;
      ctx.stroke();
    }

    ctx.font = '600 12px "Roboto Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const { label, deg } of COMPASS_CARDINALS) {
      const angleRad = ((deg - 90) * Math.PI) / 180;
      ctx.fillStyle = label === 'N' ? c.accent : c.primary;
      ctx.fillText(
        label,
        Math.cos(angleRad) * (r - COMPASS_HEADING_LABEL_OFFSET),
        Math.sin(angleRad) * (r - COMPASS_HEADING_LABEL_OFFSET),
      );
    }

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx, CANVAS_POINTER_TOP_Y);
    ctx.lineTo(cx - CANVAS_POINTER_HALF_WIDTH, 0);
    ctx.lineTo(cx + CANVAS_POINTER_HALF_WIDTH, 0);
    ctx.closePath();
    ctx.fillStyle = c.accent;
    ctx.fill();

    const headingNormalized = normalizeHeading(yaw);
    ctx.font = '600 12px "Roboto Mono", monospace';
    ctx.fillStyle = c.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${headingNormalized.toFixed(0)}°`, cx, cy);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- themeVersion forces redraw on theme change
  }, [yaw, resolveColors, themeVersion, colorsRef]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={COMPASS_HEADING_CANVAS_SIZE}
      height={COMPASS_HEADING_CANVAS_SIZE}
      className="rounded-full"
      aria-label={`Compass heading: ${String(Math.round(normalizeHeading(yaw)))}°`}
    />
  );
}
