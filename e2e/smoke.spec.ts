import { expect, test } from '@playwright/test';

test('app loads', async ({ page }) => {
  await page.goto('/robot-telemetry-dashboard/');
  await expect(page.getByText(/robot telemetry dashboard/i)).toBeVisible();
});
