import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const RE_EXPORT_PATTERN = /^export\s+(type\s+)?\{[^}]*\}\s+from\s+/;

function collectTypeFiles(dir: string): string[] {
  const results: string[] = [];

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      results.push(...collectTypeFiles(full));
    } else if (
      entry.endsWith('.ts') &&
      !entry.endsWith('.test.ts') &&
      dir.endsWith('/types')
    ) {
      results.push(full);
    }
  }

  return results;
}

describe('no barrel re-exports in types folders (ADR-001)', () => {
  const root = resolve(__dirname, '../..');
  const featuresDir = join(root, 'src/features');
  const typeFiles = collectTypeFiles(featuresDir);

  it('should not have files that only re-export from other modules', () => {
    const barrelFiles: string[] = [];

    for (const file of typeFiles) {
      const content = readFileSync(file, 'utf-8');
      const lines = content
        .split('\n')
        .filter((l) => l.trim() !== '' && !l.trim().startsWith('//'));

      const allLinesAreReExports =
        lines.length > 0 &&
        lines.every((l) => RE_EXPORT_PATTERN.test(l.trim()));

      if (allLinesAreReExports) {
        barrelFiles.push(file.replace(root + '/', ''));
      }
    }

    expect(barrelFiles).toEqual([]);
  });

  it('should not have standalone re-export lines in types files', () => {
    const reExportLines: string[] = [];

    for (const file of typeFiles) {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i]?.trim() ?? '';
        if (RE_EXPORT_PATTERN.test(trimmed)) {
          const relative = file.replace(root + '/', '');
          reExportLines.push(`${relative}:${String(i + 1)}: ${trimmed}`);
        }
      }
    }

    expect(reExportLines).toEqual([]);
  });
});
