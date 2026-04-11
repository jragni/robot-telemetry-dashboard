import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const WORKSPACE_CANVAS_FILES = [
  'src/features/workspace/components/LidarPanel/LidarPanel.tsx',
  'src/features/workspace/components/TelemetryPanel/TelemetryPanel.tsx',
  'src/features/workspace/components/ImuPanel/components/CompassHeading.tsx',
  'src/features/workspace/components/ImuPanel/components/WireframeView.tsx',
  'src/features/workspace/components/ImuPanel/components/AttitudeIndicator.tsx',
];

describe('workspace canvas components use shared useCanvasColors hook', () => {
  for (const file of WORKSPACE_CANVAS_FILES) {
    const name = file.split('/').pop() ?? file;
    const source = readFileSync(resolve(file), 'utf-8');

    it(`${name} imports useCanvasColors`, () => {
      expect(source).toContain('useCanvasColors');
    });

    it(`${name} has no inline getComputedStyle`, () => {
      expect(source).not.toContain('getComputedStyle');
    });

    it(`${name} has no hardcoded oklch values`, () => {
      const oklchPattern = /oklch\(\d/i;
      expect(oklchPattern.test(source)).toBe(false);
    });
  }
});
