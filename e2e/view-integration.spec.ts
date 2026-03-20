import { test, expect } from '@playwright/test';

const BASE = '/robot-telemetry-dashboard';

test.describe('View Integration — views render real components', () => {
  test('dashboard view renders mode switcher, not placeholder', async ({
    page,
  }) => {
    await page.goto(`${BASE}/dashboard`);
    // Should NOT see placeholder text
    await expect(page.getByText('Panels coming in Phase 6')).not.toBeVisible();
    // Should see the mode switcher buttons
    await expect(
      page.getByRole('button', { name: /dashboard/i })
    ).toBeVisible();
  });

  test('dashboard view renders default mode (Dashboard mode)', async ({
    page,
  }) => {
    await page.goto(`${BASE}/dashboard`);
    // Should see the dashboard-mode wrapper rendered by DashboardView
    await expect(page.locator('[data-testid="dashboard-mode"]')).toBeVisible();
  });

  test('fleet view renders real fleet content, not placeholder', async ({
    page,
  }) => {
    await page.goto(`${BASE}/fleet`);
    await expect(
      page.getByText('Multi-robot management coming in Phase 10')
    ).not.toBeVisible();
  });

  test('map view renders real map content, not placeholder', async ({
    page,
  }) => {
    await page.goto(`${BASE}/map`);
    await expect(
      page.getByText('OccupancyGrid visualization coming in Phase 11')
    ).not.toBeVisible();
  });
});
