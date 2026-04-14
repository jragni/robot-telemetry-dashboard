import { expect, test } from '@playwright/test';

import { collectConsoleErrors, seedTestRobot } from './helpers';

test.describe('Pilot page smoke', () => {
  test('renders without console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await seedTestRobot(page);
    await page.goto('pilot/testbot-01');
    await page.waitForLoadState('networkidle');

    const main = page.locator('main, [role="main"]').first();
    await expect(main).toBeVisible();

    expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('no horizontal page overflow', async ({ page }) => {
    await seedTestRobot(page);
    await page.goto('pilot/testbot-01');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollW, 'horizontal overflow on pilot').toBeLessThanOrEqual(
      overflow.clientW + 1,
    );
  });
});
