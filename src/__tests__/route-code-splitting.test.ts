import { describe, it, expect } from 'vitest';

describe('route-level code splitting', () => {
  it('App uses React.lazy for LandingPage', async () => {
    const source = await import('../App?raw');
    expect(source.default).toContain('lazy(');
    expect(source.default).toContain("import('./features/landing/LandingPage')");
  });

  it('App uses React.lazy for FleetPage', async () => {
    const source = await import('../App?raw');
    expect(source.default).toContain("import('./features/fleet/FleetPage')");
  });

  it('App uses React.lazy for WorkspacePage', async () => {
    const source = await import('../App?raw');
    expect(source.default).toContain("import('./features/workspace/WorkspacePage')");
  });

  it('App uses React.lazy for PilotPage', async () => {
    const source = await import('../App?raw');
    expect(source.default).toContain("import('./features/pilot/PilotPage')");
  });

  it('App uses React.lazy for MockupsPage', async () => {
    const source = await import('../App?raw');
    expect(source.default).toContain("import('./features/mockups/MockupsPage')");
  });

  it('App wraps routes in Suspense', async () => {
    const source = await import('../App?raw');
    expect(source.default).toContain('<Suspense');
  });

  it('does not eagerly import route components', async () => {
    const source = await import('../App?raw');
    const eagerPattern = /^import\s+\{[^}]*\}\s+from\s+'\.\/features\//m;
    expect(eagerPattern.test(source.default)).toBe(false);
  });

  it('lazy imports use named export re-mapping pattern', async () => {
    const source = await import('../App?raw');
    expect(source.default).toContain('.then(m => ({ default: m.');
  });
});
