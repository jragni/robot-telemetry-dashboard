import { expect, test } from '@playwright/test';

import { collectConsoleErrors, expectNoOverflow, seedTestRobot } from './helpers';

test.describe('Workspace page smoke', () => {
  test('renders without console errors and shows main content', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    // Main region should exist (either desktop grid, mobile tab layout, or not-found)
    const main = page.locator('main');
    await expect(main).toBeVisible();

    expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('controls panel content fits without clipping', async ({ page, viewport }) => {
    // Only check desktop layouts where controls panel renders
    test.skip(!viewport || viewport.width < 768, 'controls panel not in mobile layout');

    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const controlsPanel = page.locator('[aria-label*="Robot controls"]').first();
    const count = await controlsPanel.count();
    if (count === 0) test.skip(true, 'controls panel not rendered');

    await expectNoOverflow(controlsPanel);
  });

  test('no horizontal page overflow', async ({ page }) => {
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollW, 'horizontal overflow on workspace').toBeLessThanOrEqual(
      overflow.clientW + 1,
    );
  });
});
