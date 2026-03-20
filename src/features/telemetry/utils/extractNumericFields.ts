/**
 * Recursively walk an object and return all dot-path keys whose leaf value is a finite number.
 * Arrays are skipped entirely (MVP scope).
 */
export function extractNumericFields(obj: unknown, prefix = ''): string[] {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== 'object') return [];
  if (Array.isArray(obj)) return [];

  const result: string[] = [];

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'number') {
      result.push(path);
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      result.push(...extractNumericFields(value, path));
    }
    // strings, booleans, arrays, null → skip
  }

  return result;
}
