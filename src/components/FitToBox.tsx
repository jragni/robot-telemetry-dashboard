import { useEffect, useRef, useState } from 'react';

import type { FitToBoxProps } from './FitToBox.types';

/** FitToBox
 * @description Uniformly scales its content to fit the available box without
 *  scrolling. Measures the content's natural (untransformed) size against the
 *  container and applies a CSS transform scale clamped between minScale and
 *  maxScale, so the whole cluster — buttons, sliders, text — shrinks on short
 *  cells and grows on tall ones together. transform does not affect layout
 *  size, so the natural measurement stays stable (no feedback loop).
 * @prop children - The content to scale to fit.
 * @prop minScale - Lower bound on the scale factor (default 0.45).
 * @prop maxScale - Upper bound on the scale factor (default 1.5).
 * @prop align - Vertical anchor for the scaled content (default 'center').
 */
export function FitToBox({
  align = 'center',
  children,
  maxScale = 1.5,
  minScale = 0.45,
}: FitToBoxProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const recompute = () => {
      const availW = outer.clientWidth;
      const availH = outer.clientHeight;
      const contentW = inner.offsetWidth;
      const contentH = inner.offsetHeight;
      if (!contentW || !contentH || !availW || !availH) return;
      const next = Math.min(
        maxScale,
        Math.max(minScale, Math.min(availW / contentW, availH / contentH)),
      );
      setScale(next);
    };

    const observer = new ResizeObserver(recompute);
    observer.observe(outer);
    observer.observe(inner);
    return () => {
      observer.disconnect();
    };
  }, [maxScale, minScale]);

  // transform-origin must match vertical alignment, otherwise scaled-down
  // content anchored at the top is pushed out of a centered box (clipping).
  const justify = align === 'top' ? 'flex-start' : 'center';
  const origin = align === 'top' ? 'top center' : 'center center';

  return (
    <div
      ref={outerRef}
      className="h-full w-full overflow-hidden flex justify-center"
      style={{ alignItems: justify }}
    >
      <div ref={innerRef} style={{ transform: `scale(${String(scale)})`, transformOrigin: origin }}>
        {children}
      </div>
    </div>
  );
}
