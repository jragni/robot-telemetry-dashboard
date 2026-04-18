import { useCallback, useEffect, useRef } from 'react';

import { useCanvasColors } from '@/hooks';
import { formatDegrees, withAlpha } from '@/utils';
import {
  ATTITUDE_COLOR_FALLBACKS,
  ATTITUDE_TOKEN_MAP,
  PITCH_LADDER_DEGREES,
} from '@/features/workspace/constants';
import type { AttitudeIndicatorProps } from '@/features/workspace/types/ImuPanel.types';

import {
  ATTITUDE_CANVAS_SIZE,
  ATTITUDE_CROSSHAIR_INNER,
  ATTITUDE_CROSSHAIR_OUTER,
  ATTITUDE_PITCH_SCALE,
  ATTITUDE_TICK_HALF_WIDTH_MAJOR,
  ATTITUDE_TICK_HALF_WIDTH_MINOR,
  CANVAS_BORDER_INSET,
  CANVAS_POINTER_HALF_WIDTH,
  CANVAS_POINTER_TOP_Y,
} from '../constants';

/** AttitudeIndicator
 * @description Renders a canvas-based artificial horizon showing roll and pitch
 *  orientation. Sky/ground split rotates with roll, pitch offsets the horizon
 *  line. Fixed crosshair and roll pointer at top.
 * @prop roll - Roll angle in degrees.
 * @prop pitch - Pitch angle in degrees.
 */
export function AttitudeIndicator({ roll, pitch }: AttitudeIndicatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    colorsRef: rawColorsRef,
    themeVersion,
    resolveColors,
  } = useCanvasColors(ATTITUDE_COLOR_FALLBACKS, ATTITUDE_TOKEN_MAP);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    resolveColors();
    const raw = rawColorsRef.current;
    const c = {
      accent: raw.accent,
      border: raw.border,
      groundAlpha: withAlpha(raw.ground, 0.8),
      skyAlpha: withAlpha(raw.sky, 0.6),
      textPrimary: raw.textPrimary,
      textSecondaryAlpha: withAlpha(raw.textSecondary, 0.5),
    };

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
    ctx.rotate((roll * Math.PI) / 180);

    const pitchOffset = (pitch / 90) * r * ATTITUDE_PITCH_SCALE;

    ctx.beginPath();
    ctx.arc(0, 0, r - 2, Math.PI, 0);
    ctx.fillStyle = c.skyAlpha;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, r - 2, 0, Math.PI);
    ctx.fillStyle = c.groundAlpha;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-(r - 2), pitchOffset);
    ctx.lineTo(r - 2, pitchOffset);
    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-ATTITUDE_CROSSHAIR_OUTER, 0);
    ctx.lineTo(-ATTITUDE_CROSSHAIR_INNER, 0);
    ctx.moveTo(ATTITUDE_CROSSHAIR_INNER, 0);
    ctx.lineTo(ATTITUDE_CROSSHAIR_OUTER, 0);
    ctx.moveTo(0, -ATTITUDE_CROSSHAIR_INNER);
    ctx.lineTo(0, ATTITUDE_CROSSHAIR_INNER);
    ctx.strokeStyle = c.textPrimary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (const deg of PITCH_LADDER_DEGREES) {
      const y = pitchOffset - (deg / 90) * r * ATTITUDE_PITCH_SCALE;
      const halfW =
        deg % 20 === 0 ? ATTITUDE_TICK_HALF_WIDTH_MAJOR : ATTITUDE_TICK_HALF_WIDTH_MINOR;
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.strokeStyle = c.textSecondaryAlpha;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx, CANVAS_POINTER_TOP_Y);
    ctx.lineTo(cx - CANVAS_POINTER_HALF_WIDTH, 0);
    ctx.lineTo(cx + CANVAS_POINTER_HALF_WIDTH, 0);
    ctx.closePath();
    ctx.fillStyle = c.accent;
    ctx.fill();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- themeVersion forces redraw on theme change
  }, [roll, pitch, resolveColors, themeVersion, rawColorsRef]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={ATTITUDE_CANVAS_SIZE}
      height={ATTITUDE_CANVAS_SIZE}
      className="rounded-full"
      aria-label={`Attitude indicator: roll ${formatDegrees(roll)}°, pitch ${formatDegrees(pitch)}°`}
    />
  );
}
