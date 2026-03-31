import { useRef, useEffect, useCallback } from 'react';
import { withAlpha } from '@/utils/withAlpha';
import { PITCH_LADDER_DEGREES } from '@/features/workspace/constants';
import type { AttitudeIndicatorProps } from '@/features/workspace/types/ImuPanel.types';

/** AttitudeIndicator
 * @description Renders a canvas-based artificial horizon showing roll and pitch
 *  orientation. Sky/ground split rotates with roll, pitch offsets the horizon
 *  line. Fixed crosshair and roll pointer at top.
 * @param roll - Roll angle in degrees.
 * @param pitch - Pitch angle in degrees.
 */
export function AttitudeIndicator({ roll, pitch }: AttitudeIndicatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef({
    border: 'rgba(255,255,255,0.15)',
    accent: 'oklch(0.70 0.20 230)',
    skyAlpha: withAlpha('oklch(0.5 0.14 230)', 0.6),
    groundAlpha: withAlpha('oklch(0.35 0.1 65)', 0.8),
    textPrimary: 'oklch(0.93 0.01 260)',
    textSecondaryAlpha: withAlpha('oklch(0.65 0.02 260)', 0.5),
  });
  const colorsResolved = useRef(false);

  const resolveColors = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || colorsResolved.current) return;
    const styles = getComputedStyle(canvas);
    const accent = styles.getPropertyValue('--color-accent') || colorsRef.current.accent;
    const sky = styles.getPropertyValue('--color-imu-sky') || 'oklch(0.5 0.14 230)';
    const ground = styles.getPropertyValue('--color-imu-ground') || 'oklch(0.35 0.1 65)';
    const textSecondary =
      styles.getPropertyValue('--color-text-secondary') || 'oklch(0.65 0.02 260)';
    colorsRef.current = {
      border: styles.getPropertyValue('--color-border') || colorsRef.current.border,
      accent,
      skyAlpha: withAlpha(sky, 0.6),
      groundAlpha: withAlpha(ground, 0.8),
      textPrimary: styles.getPropertyValue('--color-text-primary') || colorsRef.current.textPrimary,
      textSecondaryAlpha: withAlpha(textSecondary, 0.5),
    };
    colorsResolved.current = true;
  }, []);

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
  }, [roll, pitch, resolveColors]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={120}
      className="rounded-full"
      aria-label={`Attitude indicator: roll ${String(Math.round(roll * 10) / 10)}°, pitch ${String(Math.round(pitch * 10) / 10)}°`}
    />
  );
}
