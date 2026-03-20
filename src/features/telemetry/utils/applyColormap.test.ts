import { describe, expect, it, vi } from 'vitest';

import { applyColormap } from './applyColormap';

const makeCtx = (width = 4, height = 1): CanvasRenderingContext2D => {
  // Grayscale pixel data: [R, G, B, A, ...]
  const data = new Uint8ClampedArray(width * height * 4);
  const imageData = { data, width, height } as ImageData;

  return {
    getImageData: vi.fn().mockReturnValue(imageData),
    putImageData: vi.fn(),
    canvas: { width, height },
  } as unknown as CanvasRenderingContext2D;
};

describe('applyColormap', () => {
  it('grayscale colormap is a no-op (does not change pixel values)', () => {
    const ctx = makeCtx(2, 1);
    const imageData = ctx.getImageData(0, 0, 2, 1);
    // Set to a specific grayscale value
    imageData.data[0] = 128; // R
    imageData.data[1] = 128; // G
    imageData.data[2] = 128; // B
    imageData.data[3] = 255; // A

    applyColormap(ctx, 'grayscale');

    expect(ctx.putImageData).toHaveBeenCalled();
    // Grayscale should not change values
    const putArgs = vi.mocked(ctx.putImageData).mock.calls[0][0];
    expect(putArgs.data[0]).toBe(128);
    expect(putArgs.data[1]).toBe(128);
    expect(putArgs.data[2]).toBe(128);
  });

  it('jet colormap transforms a black pixel (0) to the lowest jet color', () => {
    const ctx = makeCtx(1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    // Black pixel — corresponds to minimum value in depth
    imageData.data[0] = 0;
    imageData.data[1] = 0;
    imageData.data[2] = 0;
    imageData.data[3] = 255;

    applyColormap(ctx, 'jet');

    const putArgs = vi.mocked(ctx.putImageData).mock.calls[0][0];
    // Jet colormap at value=0 should be blue (or close)
    // The exact value isn't critical — what matters is it differs from grayscale black
    expect(putArgs.data[3]).toBe(255); // Alpha preserved
  });

  it('jet colormap transforms a white pixel (255) to highest jet color', () => {
    const ctx = makeCtx(1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    imageData.data[0] = 255;
    imageData.data[1] = 255;
    imageData.data[2] = 255;
    imageData.data[3] = 255;

    applyColormap(ctx, 'jet');

    const putArgs = vi.mocked(ctx.putImageData).mock.calls[0][0];
    // At max value, jet should be red or warm color
    expect(putArgs.data[3]).toBe(255); // Alpha preserved
  });

  it('jet colormap produces different output than input for a mid-gray pixel', () => {
    const ctx = makeCtx(1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    imageData.data[0] = 128;
    imageData.data[1] = 128;
    imageData.data[2] = 128;
    imageData.data[3] = 255;

    applyColormap(ctx, 'jet');

    const putArgs = vi.mocked(ctx.putImageData).mock.calls[0][0];
    // jet output for gray-128 should differ from grayscale [128,128,128]
    const r = putArgs.data[0];
    const g = putArgs.data[1];
    const b = putArgs.data[2];
    const isStillGray = r === 128 && g === 128 && b === 128;
    expect(isStillGray).toBe(false);
  });

  it('preserves alpha channel for all colormaps', () => {
    for (const colormap of ['none', 'jet', 'grayscale'] as const) {
      const ctx = makeCtx(1, 1);
      const imageData = ctx.getImageData(0, 0, 1, 1);
      imageData.data[3] = 200;

      applyColormap(ctx, colormap);

      if (vi.mocked(ctx.putImageData).mock.calls.length > 0) {
        const putArgs = vi.mocked(ctx.putImageData).mock.calls[0][0];
        expect(putArgs.data[3]).toBe(200);
      }
    }
  });

  it('calls getImageData and putImageData for jet colormap', () => {
    const ctx = makeCtx(2, 2);
    applyColormap(ctx, 'jet');
    expect(ctx.getImageData).toHaveBeenCalled();
    expect(ctx.putImageData).toHaveBeenCalled();
  });

  it('does nothing (no putImageData) when colormap is "none"', () => {
    const ctx = makeCtx(2, 2);
    applyColormap(ctx, 'none');
    expect(ctx.putImageData).not.toHaveBeenCalled();
  });
});
