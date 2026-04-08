import { expect, test } from '@playwright/test';

import { collectConsoleErrors } from './helpers';

test.describe('Landing page smoke', () => {
  test('renders without console errors and shows hero content', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('');
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, [role="heading"]').first();
    await expect(heading).toBeVisible();

    expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('has no horizontal page overflow', async ({ page }) => {
    await page.goto('');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    expect(overflow.scrollW, 'horizontal overflow on landing').toBeLessThanOrEqual(
      overflow.clientW + 1,
    );
  });
});
