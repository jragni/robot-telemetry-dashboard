import { expect, test } from '@playwright/test';

const BASE = '/robot-telemetry-dashboard';

test.describe('IA Redesign — Phase 8', () => {
  test.describe('Sidebar presence', () => {
    test('sidebar is visible with a fleet section', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await expect(page.getByRole('complementary')).toBeVisible();
      await expect(page.getByText(/fleet/i)).toBeVisible();
    });

    test('sidebar has a Map nav item', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await expect(page.getByRole('link', { name: /map/i })).toBeVisible();
    });

    test('sidebar has a Settings item', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await expect(page.getByText(/settings/i)).toBeVisible();
    });
  });

  test.describe('Header — no nav links', () => {
    test('header does NOT contain Dashboard | Fleet | Map nav links', async ({
      page,
    }) => {
      await page.goto(`${BASE}/`);
      const header = page.getByRole('banner');
      await expect(
        header.getByRole('navigation', { name: 'Main navigation' })
      ).not.toBeVisible();
    });

    test('header shows app title', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await expect(
        page.getByRole('banner').getByText(/robot telemetry dashboard/i)
      ).toBeVisible();
    });
  });

  test.describe('No mode switcher', () => {
    test('mode switcher (DASHBOARD | PILOT | ENGINEER) is gone', async ({
      page,
    }) => {
      await page.goto(`${BASE}/`);
      await expect(
        page.getByRole('button', { name: /^dashboard$/i })
      ).not.toBeVisible();
      await expect(
        page.getByRole('button', { name: /^pilot$/i })
      ).not.toBeVisible();
      await expect(
        page.getByRole('button', { name: /^engineer$/i })
      ).not.toBeVisible();
    });
  });

  test.describe('Routes', () => {
    test('/ renders FleetOverview', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await expect(page.getByText(/fleet overview/i)).toBeVisible();
    });

    test('/robot/:robotId renders RobotWorkspace', async ({ page }) => {
      await page.goto(`${BASE}/robot/bot-1`);
      await expect(
        page.locator('[data-testid="robot-workspace"]')
      ).toBeVisible();
    });

    test('/map renders SharedMapView', async ({ page }) => {
      await page.goto(`${BASE}/map`);
      await expect(page.getByText(/map/i)).toBeVisible();
    });

    test('old /dashboard route is 404 or redirects to /', async ({ page }) => {
      await page.goto(`${BASE}/dashboard`);
      const isRoot =
        page.url().endsWith('/') ||
        page.url().endsWith('/robot-telemetry-dashboard/');
      const has404 = await page
        .getByText('404')
        .isVisible()
        .catch(() => false);
      expect(isRoot || has404).toBe(true);
    });

    test('old /fleet route is 404 or redirects to /', async ({ page }) => {
      await page.goto(`${BASE}/fleet`);
      const isRoot =
        page.url().endsWith('/') ||
        page.url().endsWith('/robot-telemetry-dashboard/');
      const has404 = await page
        .getByText('404')
        .isVisible()
        .catch(() => false);
      expect(isRoot || has404).toBe(true);
    });

    test('old /pilot route is 404 or redirects to /', async ({ page }) => {
      await page.goto(`${BASE}/pilot`);
      const isRoot =
        page.url().endsWith('/') ||
        page.url().endsWith('/robot-telemetry-dashboard/');
      const has404 = await page
        .getByText('404')
        .isVisible()
        .catch(() => false);
      expect(isRoot || has404).toBe(true);
    });
  });

  test.describe('Sidebar navigation', () => {
    test('click Map in sidebar → navigates to /map', async ({ page }) => {
      await page.goto(`${BASE}/`);
      await page.getByRole('link', { name: /map/i }).click();
      await expect(page).toHaveURL(new RegExp(`${BASE}/map`));
    });

    test('click robot in sidebar → main content shows robot workspace', async ({
      page,
    }) => {
      // This test requires at least one robot — skip gracefully if none
      await page.goto(`${BASE}/`);
      const robotLinks = page.locator('[data-testid="sidebar-robot-link"]');
      const count = await robotLinks.count();
      test.skip(
        count === 0,
        'No robots connected — skipping robot drill-down test'
      );
      await robotLinks.first().click();
      await expect(
        page.locator('[data-testid="robot-workspace"]')
      ).toBeVisible();
    });
  });

  test.describe('Icon rail on collapse', () => {
    test('icon rail is visible when sidebar is at minimum width', async ({
      page,
    }) => {
      await page.goto(`${BASE}/`);
      // Drag the resize handle to collapse sidebar
      const handle = page.locator('[data-testid="sidebar-resize-handle"]');
      const handleBox = await handle.boundingBox();
      if (handleBox) {
        await page.mouse.move(
          handleBox.x + handleBox.width / 2,
          handleBox.y + handleBox.height / 2
        );
        await page.mouse.down();
        await page.mouse.move(0, handleBox.y + handleBox.height / 2, {
          steps: 20,
        });
        await page.mouse.up();
      }
      await expect(page.locator('[data-testid="icon-rail"]')).toBeVisible();
    });
  });
});
