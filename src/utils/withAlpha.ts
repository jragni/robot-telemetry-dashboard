export function withAlpha(color: string, alpha: number): string {
  const trimmed = color.trim();
  if (trimmed.startsWith('oklch(')) {
    return trimmed.replace(')', ` / ${String(alpha)})`);
  }
  return `color-mix(in oklch, ${trimmed} ${String(Math.round(alpha * 100))}%, transparent)`;
}
