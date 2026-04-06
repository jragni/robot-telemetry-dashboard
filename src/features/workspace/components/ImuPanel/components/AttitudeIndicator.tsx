import { useRef, useEffect, useCallback } from 'react';
import { formatDegrees } from '@/utils/formatDegrees';
import { withAlpha } from '@/utils/withAlpha';
import { useCanvasColors } from '@/hooks';
import {
  PITCH_LADDER_DEGREES,
  ATTITUDE_COLOR_FALLBACKS,
  ATTITUDE_TOKEN_MAP,
} from '@/features/workspace/constants';
import type { AttitudeIndicatorProps } from '@/features/workspace/types/ImuPanel.types';

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
    const r = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = c.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((roll * Math.PI) / 180);

    const pitchOffset = (pitch / 90) * r * 0.6;

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
    ctx.moveTo(-8, 0);
    ctx.lineTo(-3, 0);
    ctx.moveTo(3, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(0, -3);
    ctx.lineTo(0, 3);
    ctx.strokeStyle = c.textPrimary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (const deg of PITCH_LADDER_DEGREES) {
      const y = pitchOffset - (deg / 90) * r * 0.6;
      const halfW = deg % 20 === 0 ? 10 : 6;
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.strokeStyle = c.textSecondaryAlpha;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx, 6);
    ctx.lineTo(cx - 4, 0);
    ctx.lineTo(cx + 4, 0);
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
      width={120}
      height={120}
      className="rounded-full"
      aria-label={`Attitude indicator: roll ${formatDegrees(roll)}°, pitch ${formatDegrees(pitch)}°`}
    />
  );
}
