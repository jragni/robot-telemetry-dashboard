import { expect, test } from '@playwright/test';

const BASE = '/robot-telemetry-dashboard';

test.describe('Navigation', () => {
  test('redirects / to /dashboard', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(new RegExp(`${BASE}/dashboard`));
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('navigates to Fleet via header nav', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByText('Fleet')
      .click();
    await expect(page).toHaveURL(new RegExp(`${BASE}/fleet`));
    await expect(page.getByText('Fleet Overview')).toBeVisible();
  });

  test('navigates to Map via header nav', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`);
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByText('Map')
      .click();
    await expect(page).toHaveURL(new RegExp(`${BASE}/map`));
    await expect(page.getByText('SLAM Map')).toBeVisible();
  });

  test('pilot/:robotId renders fullscreen pilot view', async ({ page }) => {
    await page.goto(`${BASE}/pilot/robot-1`);
    await expect(page.getByText('Pilot Mode')).toBeVisible();
    await expect(page.getByText('robot-1')).toBeVisible();
  });

  test('unknown routes show 404', async ({ page }) => {
    await page.goto(`${BASE}/nonexistent`);
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('404 page has link back to dashboard', async ({ page }) => {
    await page.goto(`${BASE}/nonexistent`);
    await page.getByText('Back to Dashboard').click();
    await expect(page).toHaveURL(new RegExp(`${BASE}/dashboard`));
  });
});
