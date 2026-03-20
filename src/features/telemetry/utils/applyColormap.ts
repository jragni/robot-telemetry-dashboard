export type ColormapType = 'none' | 'grayscale' | 'jet';

/**
 * Apply a colormap in-place to all pixels in the canvas context.
 * Uses the R channel of each pixel as the intensity value (0–255).
 */
export function applyColormap(
  ctx: CanvasRenderingContext2D,
  colormap: ColormapType
): void {
  if (colormap === 'none') return;

  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;

  if (colormap === 'grayscale') {
    // No-op: already grayscale; just putImageData back unchanged
    ctx.putImageData(imageData, 0, 0);
    return;
  }

  if (colormap === 'jet') {
    for (let i = 0; i < data.length; i += 4) {
      const v = data[i] / 255; // normalize to [0,1]
      const [r, g, b] = jetColor(v);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      // alpha (data[i+3]) is preserved
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

/** Compute Jet colormap RGB for normalized value v in [0, 1]. */
function jetColor(v: number): [number, number, number] {
  const r = clamp(Math.min(4 * v - 1.5, -4 * v + 4.5));
  const g = clamp(Math.min(4 * v - 0.5, -4 * v + 3.5));
  const b = clamp(Math.min(4 * v + 0.5, -4 * v + 2.5));
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}
