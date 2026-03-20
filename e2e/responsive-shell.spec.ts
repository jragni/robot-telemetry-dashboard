import { expect, test } from '@playwright/test';

const BASE = '/robot-telemetry-dashboard';

test.describe('Responsive Shell', () => {
  test('desktop shows header nav and sidebar, hides bottom bar', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    await expect(
      page.getByRole('navigation', { name: 'Main navigation' })
    ).toBeVisible();
    await expect(page.getByLabelText('Sidebar')).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' })
    ).not.toBeVisible();
  });

  test('mobile shows bottom tab bar, hides header nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);

    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' })
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Main navigation' })
    ).not.toBeVisible();
  });

  test('mobile bottom bar hides during pilot mode', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/pilot/robot-1`);

    await expect(
      page.getByRole('navigation', { name: 'Mobile navigation' })
    ).not.toBeVisible();
  });

  test('sidebar toggle collapses and expands sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    const sidebar = page.getByLabelText('Sidebar');
    await expect(sidebar).toBeVisible();

    await page.getByLabelText('Close sidebar').click();
    await expect(page.getByLabelText('Open sidebar')).toBeVisible();

    await page.getByLabelText('Open sidebar').click();
    await expect(page.getByLabelText('Close sidebar')).toBeVisible();
  });
});
