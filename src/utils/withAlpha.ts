/** withAlpha
 * @description Applies an alpha channel to an OKLCH or arbitrary CSS color string.
 * @param color - The base color value.
 * @param alpha - Opacity from 0 to 1.
 */
export function withAlpha(color: string, alpha: number): string {
  const trimmed = color.trim();
  if (trimmed.startsWith('oklch(')) {
    return trimmed.replace(')', ` / ${String(alpha)})`);
  }
  return `color-mix(in oklch, ${trimmed} ${String(Math.round(alpha * 100))}%, transparent)`;
}
