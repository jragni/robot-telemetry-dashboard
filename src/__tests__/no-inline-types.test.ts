import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const INLINE_TYPE_PATTERN = /^(export\s+)?(interface|type)\s+\w+/;

const TARGET_FILES = [
  'src/components/ErrorBoundary.tsx',
  'src/components/PanelErrorBoundary.tsx',
  'src/components/DesktopOnlyGate.tsx',
  'src/features/pilot/components/PilotStatusBar/BatteryRow.tsx',
];

describe('no inline interface/type definitions in .tsx files', () => {
  const root = resolve(__dirname, '../..');

  for (const file of TARGET_FILES) {
    it(`${file} should not define interfaces or types inline`, () => {
      const content = readFileSync(resolve(root, file), 'utf-8');
      const lines = content.split('\n');
      const violations: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i]?.trim() ?? '';
        if (INLINE_TYPE_PATTERN.test(trimmed)) {
          violations.push(`line ${String(i + 1)}: ${trimmed}`);
        }
      }

      expect(violations, `Found inline type definitions:\n${violations.join('\n')}`).toEqual([]);
    });
  }
});
