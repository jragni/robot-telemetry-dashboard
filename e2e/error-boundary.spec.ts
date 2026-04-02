import { test, expect } from '@playwright/test';

test.describe('Error Boundaries', () => {
  test('root error boundary does not show on normal page load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

  test('app renders fleet page without error boundary fallback', async ({ page }) => {
    await page.goto('/fleet');
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });
});
