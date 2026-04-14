import { defineConfig } from '@playwright/test';

const VIEWPORTS = [
  { name: 'desktop-lg', width: 1920, height: 1080 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
  { name: 'mobile-sm', width: 320, height: 568 },
];

/** Smoke test config — runs minimal route-level tests across 5 viewports in parallel.
 * Used in pre-push hook to catch broken UI that unit tests miss.
 */
export default defineConfig({
  testDir: './e2e/smoke',
  testMatch: '**/*.smoke.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: undefined,
  reporter: [['list'], ['html', { outputFolder: '.playwright-mcp/smoke-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173/robot-telemetry-dashboard/',
    trace: 'retain-on-failure',
  },
  projects: VIEWPORTS.map((vp) => ({
    name: vp.name,
    use: {
      viewport: { width: vp.width, height: vp.height },
      userAgent: vp.name.startsWith('mobile') ? 'Mozilla/5.0 (iPhone) Mobile' : undefined,
    },
  })),
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/robot-telemetry-dashboard/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
