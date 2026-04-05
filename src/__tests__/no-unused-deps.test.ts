import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, it, expect } from 'vitest';

const BANNED_PACKAGES = [
  'd3',
  'gsap',
  'next-themes',
  'observable-hooks',
  'react-grid-layout',
  'react-is',
  'recharts',
  'rxjs',
];

describe('no unused dependencies', () => {
  it('banned packages are not in package.json dependencies', () => {
    const pkgPath = resolve(__dirname, '../../package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
      dependencies?: Record<string, string>;
    };
    const deps = Object.keys(pkg.dependencies ?? {});

    for (const banned of BANNED_PACKAGES) {
      expect(deps).not.toContain(banned);
    }
  });

  it('banned packages are not imported in src/', () => {
    const srcDir = resolve(__dirname, '..');

    for (const pkg of BANNED_PACKAGES) {
      let result = '';
      try {
        result = execFileSync(
          'grep',
          ['-r', `from '${pkg}`, srcDir],
          { encoding: 'utf-8' },
        ).trim();
      } catch {
        // grep returns exit code 1 when no matches found
        result = '';
      }

      expect(result, `found import of "${pkg}" in src/`).toBe('');
    }
  });
});
