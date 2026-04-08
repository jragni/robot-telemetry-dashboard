import { expect, test } from '@playwright/test';

import { collectConsoleErrors, seedTestRobot } from './helpers';

test.describe('Fleet page smoke', () => {
  test('renders fleet with seeded robot and no console errors', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await seedTestRobot(page);
    await page.goto('fleet');
    await page.waitForLoadState('networkidle');

    const addButton = page.getByRole('button', { name: /add robot/i });
    await expect(addButton).toBeVisible();

    expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('has no horizontal page overflow', async ({ page }) => {
    await seedTestRobot(page);
    await page.goto('fleet');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollW, 'horizontal overflow on fleet').toBeLessThanOrEqual(
      overflow.clientW + 1,
    );
  });
});
