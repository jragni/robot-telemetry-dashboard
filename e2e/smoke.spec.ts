import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Smoke tests — verify the app loads and basic navigation works.
// These tests run against the Vite dev server (configured in playwright.config).
// ---------------------------------------------------------------------------

test.describe('App smoke tests', () => {
  // -------------------------------------------------------------------------
  // App loads
  // -------------------------------------------------------------------------

  test('app loads and redirects to /dashboard', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/');

    // Should be redirected to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('dashboard page renders the app title', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/dashboard');

    await expect(page.getByText(/robot telemetry dashboard/i)).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  test('navigation to Fleet view works', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/dashboard');

    // Click Fleet nav link
    await page.getByRole('link', { name: /fleet/i }).click();

    await expect(page).toHaveURL(/\/fleet/);
    await expect(page.getByText(/fleet overview/i)).toBeVisible();
  });

  test('navigation to Map view works', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/dashboard');

    await page.getByRole('link', { name: /map/i }).click();

    await expect(page).toHaveURL(/\/map/);
  });

  test('navigation back to Dashboard view works', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/fleet');

    await page.getByRole('link', { name: /dashboard/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  // -------------------------------------------------------------------------
  // Sidebar and connections
  // -------------------------------------------------------------------------

  test('sidebar renders with the Add Robot form', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/dashboard');

    // The sidebar should contain the Add Robot form
    await expect(page.getByRole('form', { name: /add robot/i })).toBeVisible();

    await expect(
      page.getByRole('textbox', { name: /robot name/i })
    ).toBeVisible();

    await expect(
      page.getByRole('textbox', { name: /base url/i })
    ).toBeVisible();
  });

  test('sidebar toggle button shows and hides the sidebar', async ({
    page,
  }) => {
    await page.goto('/robot-telemetry-dashboard/dashboard');

    const toggleBtn = page.getByRole('button', {
      name: /open sidebar|close sidebar/i,
    });

    // Sidebar should be visible initially (default sidebarOpen: true in store)
    await expect(
      page.getByRole('navigation', { name: /robot connections/i })
    ).toBeVisible();

    // Click toggle to hide
    await toggleBtn.click();

    // On desktop the sidebar slides out (not removed from DOM, just off-screen)
    // Verify toggle button aria-label changes
    await expect(
      page.getByRole('button', { name: /open sidebar/i })
    ).toBeVisible();
  });

  test('adding a robot shows it in the sidebar list', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/dashboard');

    // Fill in the Add Robot form
    await page.getByRole('textbox', { name: /robot name/i }).fill('Test Bot');
    await page
      .getByRole('textbox', { name: /base url/i })
      .fill('ws://localhost:9090');

    // Submit
    await page.getByRole('button', { name: /add.*connect/i }).click();

    // The robot should appear in the sidebar
    await expect(page.getByText('Test Bot')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 404
  // -------------------------------------------------------------------------

  test('unknown routes render the 404 page', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/does-not-exist');

    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
