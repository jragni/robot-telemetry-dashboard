/** withAlpha
 * @description Appends an alpha channel to a resolved CSS color string.
 *  Handles oklch(...) by inserting `/ alpha` before the closing paren,
 *  and falls back to wrapping in `color-mix()` for other formats.
 * @param color - The resolved CSS color value.
 * @param alpha - Alpha value between 0 and 1.
 * @returns A CSS color string with alpha applied.
 */
export function withAlpha(color: string, alpha: number): string {
  const trimmed = color.trim();
  if (trimmed.startsWith('oklch(')) {
    return trimmed.replace(')', ` / ${String(alpha)})`);
  }
  return `color-mix(in oklch, ${trimmed} ${String(Math.round(alpha * 100))}%, transparent)`;
}
