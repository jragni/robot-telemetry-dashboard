import { test, expect } from '@playwright/test';

test.describe('Visual Gate -- Phase 01: Scaffolding', () => {
  test('app renders with content (not blank screen)', async ({ page }) => {
    await page.goto('/');

    // Root element exists and has children
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // App has meaningful content (not blank)
    const children = await root.locator('> *').count();
    expect(children).toBeGreaterThan(0);

    // Heading confirms correct app loaded
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Robot Telemetry Dashboard');
  });

  test('no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Zero console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('baseline screenshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Baseline for visual regression
    await expect(page).toHaveScreenshot('01-scaffolding-baseline.png', {
      fullPage: true,
    });
  });
});
