import { useRef, useEffect, useState } from 'react';
import { useCanvasColors } from '@/hooks/useCanvasColors';
import { COMPASS_CARDINALS } from '@/constants/canvas';
import {
  COMPASS_TICK_MAJOR_INTERVAL,
  COMPASS_TICK_MINOR_INTERVAL,
  COMPASS_DEGREES_VISIBLE,
  COMPASS_TOKEN_MAP,
  COMPASS_COLOR_FALLBACKS,
  COMPASS_FADE_WIDTH,
  COMPASS_STRIP_HEIGHT_MOBILE,
  COMPASS_TICK_HEIGHT_MAJOR_MOBILE,
  COMPASS_TICK_HEIGHT_MINOR_MOBILE,
  COMPASS_POINTER_HALF_WIDTH_MOBILE,
  COMPASS_POINTER_HEIGHT_MOBILE,
} from '../constants';
import type { PilotCompassProps } from '../types/PilotView.types';

/** PilotCompassMobile
 * @description Renders a full-width ODST-inspired compass heading strip for
 *  mobile. Ticks and degree labels share the same vertical center line.
 *  Cardinals (N/E/S/W) rendered in accent color at their tick positions.
 *  Fills 100% of the container width via ResizeObserver.
 * @param heading - Current heading in degrees (0-360).
 */
export function PilotCompassMobile({ heading }: PilotCompassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const { colorsRef, themeVersion, resolveColors } = useCanvasColors(
    COMPASS_COLOR_FALLBACKS,
    COMPASS_TOKEN_MAP,
  );

  // ── Measure container width via ResizeObserver ─────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const next = Math.floor(entry.contentRect.width);
        setWidth((prev) => (prev === next ? prev : next));
      }
    });
    observer.observe(el);
    return () => { observer.disconnect(); };
  }, []);

  // ── Draw compass ──────────────────────────────────────────────────
  // CSS width stays 100% — only the backing-store pixel dimensions
  // change, so this does not trigger a ResizeObserver loop (ISS-008).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    resolveColors();
    const colors = colorsRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = width;
    const h = COMPASS_STRIP_HEIGHT_MOBILE;
    const cy = h / 2;

    const scaledW = w * dpr;
    const scaledH = h * dpr;
    if (canvas.width !== scaledW) canvas.width = scaledW;
    if (canvas.height !== scaledH) canvas.height = scaledH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const pxPerDeg = w / COMPASS_DEGREES_VISIBLE;
    const cardinalSet = new Map(COMPASS_CARDINALS.map((c) => [c.deg, c.label]));

    // ── Ticks + labels (ODST style: inline at same vertical center) ──
    for (let deg = 0; deg < 360; deg += COMPASS_TICK_MINOR_INTERVAL) {
      let offset = deg - heading;
      if (offset > 180) offset -= 360;
      if (offset < -180) offset += 360;

      const x = centerX + offset * pxPerDeg;
      if (x < -10 || x > w + 10) continue;

      const isMajor = deg % COMPASS_TICK_MAJOR_INTERVAL === 0;
      const cardinal = cardinalSet.get(deg);
      const tickH = isMajor ? COMPASS_TICK_HEIGHT_MAJOR_MOBILE : COMPASS_TICK_HEIGHT_MINOR_MOBILE;

      // Tick line — centered vertically
      ctx.beginPath();
      ctx.strokeStyle = isMajor ? colors.tickMajor : colors.tickMinor;
      ctx.lineWidth = isMajor ? 1 : 0.5;
      ctx.moveTo(x, cy - tickH / 2);
      ctx.lineTo(x, cy + tickH / 2);
      ctx.stroke();

      // Label — inline next to tick, offset right
      if (cardinal) {
        ctx.font = '600 12px Exo, sans-serif';
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(cardinal, x + 3, cy);
      } else if (isMajor) {
        ctx.font = '400 12px "Roboto Mono", monospace';
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(deg), x + 3, cy);
      }
    }

    // ── Center pointer triangle (top-down) ──────────────────────────
    ctx.beginPath();
    ctx.fillStyle = colors.accent;
    ctx.moveTo(centerX - COMPASS_POINTER_HALF_WIDTH_MOBILE, 0);
    ctx.lineTo(centerX + COMPASS_POINTER_HALF_WIDTH_MOBILE, 0);
    ctx.lineTo(centerX, COMPASS_POINTER_HEIGHT_MOBILE);
    ctx.closePath();
    ctx.fill();

    // ── Bottom pointer triangle (mirror) ────────────────────────────
    ctx.beginPath();
    ctx.fillStyle = colors.accent;
    ctx.moveTo(centerX - COMPASS_POINTER_HALF_WIDTH_MOBILE, h);
    ctx.lineTo(centerX + COMPASS_POINTER_HALF_WIDTH_MOBILE, h);
    ctx.lineTo(centerX, h - COMPASS_POINTER_HEIGHT_MOBILE);
    ctx.closePath();
    ctx.fill();

    // ── Fade edges ──────────────────────────────────────────────────
    const fadeW = Math.min(COMPASS_FADE_WIDTH, w * 0.15);
    const fadeLeft = ctx.createLinearGradient(0, 0, fadeW, 0);
    fadeLeft.addColorStop(0, 'rgba(0,0,0,1)');
    fadeLeft.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = fadeLeft;
    ctx.fillRect(0, 0, fadeW, h);

    const fadeRight = ctx.createLinearGradient(w - fadeW, 0, w, 0);
    fadeRight.addColorStop(0, 'rgba(0,0,0,0)');
    fadeRight.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = fadeRight;
    ctx.fillRect(w - fadeW, 0, fadeW, h);
    ctx.globalCompositeOperation = 'source-over';
  }, [heading, width, themeVersion, resolveColors, colorsRef]);

  return (
    <div ref={containerRef} className="w-full" aria-label={`Heading: ${heading.toFixed(0)} degrees`}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: COMPASS_STRIP_HEIGHT_MOBILE, display: 'block' }}
      />
    </div>
  );
}
