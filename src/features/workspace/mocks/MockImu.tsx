import { useState, useRef, useEffect, useCallback } from 'react';

/* ── Stable number display ────────────────────────────────────── */
function StableValue({
  value,
  suffix = '°',
}: {
  value: number;
  suffix?: string;
}) {
  return (
    <span className="font-mono text-accent font-semibold tabular-nums w-16 text-right inline-block">
      {value.toFixed(1)}
      {suffix}
    </span>
  );
}

function ValueRow({
  label,
  value,
  suffix = '°',
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-text-muted w-10">{label}</span>
      <StableValue value={value} suffix={suffix} />
    </div>
  );
}

/* ── Attitude Indicator (canvas) ──────────────────────────────── */
function AttitudeIndicator({ roll, pitch }: { roll: number; pitch: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle =
      getComputedStyle(canvas).getPropertyValue('--color-border') ||
      'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((roll * Math.PI) / 180);

    const pitchOffset = (pitch / 90) * r * 0.6;

    ctx.beginPath();
    ctx.arc(0, 0, r - 2, Math.PI, 0);
    ctx.fillStyle = 'oklch(0.35 0.08 230 / 0.6)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, r - 2, 0, Math.PI);
    ctx.fillStyle = 'oklch(0.20 0.04 260 / 0.8)';
    ctx.fill();

    const accentColor =
      getComputedStyle(canvas).getPropertyValue('--color-accent') ||
      'oklch(0.70 0.20 230)';
    ctx.beginPath();
    ctx.moveTo(-(r - 2), pitchOffset);
    ctx.lineTo(r - 2, pitchOffset);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(-3, 0);
    ctx.moveTo(3, 0);
    ctx.lineTo(8, 0);
    ctx.moveTo(0, -3);
    ctx.lineTo(0, 3);
    ctx.strokeStyle = 'oklch(0.93 0.01 260)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (const deg of [-20, -10, 10, 20]) {
      const y = pitchOffset - (deg / 90) * r * 0.6;
      const halfW = deg % 20 === 0 ? 10 : 6;
      ctx.beginPath();
      ctx.moveTo(-halfW, y);
      ctx.lineTo(halfW, y);
      ctx.strokeStyle = 'oklch(0.65 0.02 260 / 0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx, 6);
    ctx.lineTo(cx - 4, 0);
    ctx.lineTo(cx + 4, 0);
    ctx.closePath();
    ctx.fillStyle = accentColor;
    ctx.fill();
  }, [roll, pitch]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas ref={canvasRef} width={100} height={100} className="rounded-full" />
  );
}

/* ── Compass Heading (canvas) ─────────────────────────────────── */
function CompassHeading({ yaw }: { yaw: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    const accentColor =
      getComputedStyle(canvas).getPropertyValue('--color-accent') ||
      'oklch(0.70 0.20 230)';
    const borderColor =
      getComputedStyle(canvas).getPropertyValue('--color-border') ||
      'rgba(255,255,255,0.15)';
    const mutedColor = 'oklch(0.57 0.02 260)';
    const primaryColor = 'oklch(0.93 0.01 260)';

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-yaw * Math.PI) / 180);

    const cardinals = [
      { label: 'N', deg: 0 },
      { label: 'E', deg: 90 },
      { label: 'S', deg: 180 },
      { label: 'W', deg: 270 },
    ];

    for (let deg = 0; deg < 360; deg += 10) {
      const angleRad = ((deg - 90) * Math.PI) / 180;
      const isCardinal = deg % 90 === 0;
      const is30 = deg % 30 === 0;
      const tickLen = isCardinal ? 10 : is30 ? 6 : 3;

      ctx.beginPath();
      ctx.moveTo(Math.cos(angleRad) * r, Math.sin(angleRad) * r);
      ctx.lineTo(
        Math.cos(angleRad) * (r - tickLen),
        Math.sin(angleRad) * (r - tickLen),
      );
      ctx.strokeStyle = isCardinal ? primaryColor : mutedColor;
      ctx.lineWidth = isCardinal ? 1.5 : 0.8;
      ctx.stroke();
    }

    for (const { label, deg } of cardinals) {
      const angleRad = ((deg - 90) * Math.PI) / 180;
      ctx.font = '600 12px "Roboto Mono", monospace';
      ctx.fillStyle = label === 'N' ? accentColor : primaryColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        label,
        Math.cos(angleRad) * (r - 18),
        Math.sin(angleRad) * (r - 18),
      );
    }

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(cx, 6);
    ctx.lineTo(cx - 4, 0);
    ctx.lineTo(cx + 4, 0);
    ctx.closePath();
    ctx.fillStyle = accentColor;
    ctx.fill();

    const headingNormalized = ((yaw % 360) + 360) % 360;
    ctx.font = '600 12px "Roboto Mono", monospace';
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${headingNormalized.toFixed(0)}°`, cx, cy);
  }, [yaw]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas ref={canvasRef} width={100} height={100} className="rounded-full" />
  );
}

/* ── Animated hook ────────────────────────────────────────────── */
/** useAnimatedIMU
 * @description Provides smoothly animated IMU values for preview purposes.
 * @returns An object with roll, pitch, and yaw values that update over time.
 */
export function useAnimatedIMU() {
  const [values, setValues] = useState({ roll: 12.4, pitch: -3.1, yaw: 187.8 });

  useEffect(() => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.2;
      setValues({
        roll: 12.4 + Math.sin(t * 0.7) * 8,
        pitch: -3.1 + Math.sin(t * 0.5) * 5,
        yaw: 187.8 + Math.sin(t * 0.3) * 15,
      });
    }, 200);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return values;
}

/* ── Animated wrapper ──────────────────────────────────────────── */
/** AnimatedMockImu
 * @description Renders an animated IMU display using useAnimatedIMU
 *  for live preview.
 */
export function AnimatedMockImu() {
  const imu = useAnimatedIMU();
  return <MockImu roll={imu.roll} pitch={imu.pitch} yaw={imu.yaw} />;
}

/* ── IMU Content (attitude + compass default) ─────────────────── */
/** MockImu
 * @description Renders the IMU display with attitude indicator, compass heading,
 *  and numeric readouts.
 * @param roll - Roll angle in degrees.
 * @param pitch - Pitch angle in degrees.
 * @param yaw - Yaw heading in degrees.
 */
export function MockImu({
  roll,
  pitch,
  yaw,
}: {
  roll: number;
  pitch: number;
  yaw: number;
}) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <AttitudeIndicator roll={roll} pitch={pitch} />
      <CompassHeading yaw={yaw} />
      <div className="flex flex-col gap-2">
        <ValueRow label="ROLL" value={roll} />
        <ValueRow label="PITCH" value={pitch} />
        <ValueRow label="HDG" value={((yaw % 360) + 360) % 360} />
      </div>
    </div>
  );
}
