import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Responsive panel grid tests — verify panels rearrange correctly across
// viewport sizes without crashes or infinite growth (ISS-008 regression).
// ---------------------------------------------------------------------------

test.describe('Responsive panel grid', () => {
  test.beforeEach(async ({ page }) => {
    // Close sidebar for consistent grid width at all breakpoints
    await page.goto('/robot-telemetry-dashboard/dashboard');
    const closeBtn = page.getByRole('button', {
      name: /close sidebar/i,
    });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  });

  // -------------------------------------------------------------------------
  // Desktop layout (lg breakpoint: >=1200px)
  // -------------------------------------------------------------------------

  test('desktop: panels render in multi-column grid', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // All 5 default panels should be visible
    await expect(page.getByText('Video Feed').first()).toBeVisible();
    await expect(page.getByText('LiDAR View').first()).toBeVisible();
    await expect(page.getByText('IMU Display').first()).toBeVisible();
    await expect(page.getByText('Connection Status').first()).toBeVisible();
    await expect(page.getByText('Topic List').first()).toBeVisible();

    // Page should not have excessive height (no infinite growth)
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox).not.toBeNull();
    expect(bodyBox.height).toBeLessThan(2000);
  });

  // -------------------------------------------------------------------------
  // Desktop → Tablet transition (ISS-008 regression test)
  // -------------------------------------------------------------------------

  test('desktop to tablet: panels reflow without crash', async ({ page }) => {
    // Start at desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByText('Video Feed').first()).toBeVisible();

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });

    // Panels should still be visible (not blank/crashed)
    await expect(page.getByText('Video Feed').first()).toBeVisible();
    await expect(page.getByText('LiDAR View').first()).toBeVisible();

    // Page height should be reasonable (not 16M pixels)
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox).not.toBeNull();
    expect(bodyBox.height).toBeLessThan(5000);
  });

  // -------------------------------------------------------------------------
  // Tablet → Mobile transition
  // -------------------------------------------------------------------------

  test('tablet to mobile: panels stack in single column', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Video Feed').first()).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 812 });

    // Panels should still be visible
    await expect(page.getByText('Video Feed').first()).toBeVisible();

    // Page height should be reasonable
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox).not.toBeNull();
    expect(bodyBox.height).toBeLessThan(5000);
  });

  // -------------------------------------------------------------------------
  // Full roundtrip: Desktop → Tablet → Mobile → Desktop
  // -------------------------------------------------------------------------

  test('full roundtrip resize does not crash or lose panels', async ({
    page,
  }) => {
    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByText('Video Feed').first()).toBeVisible();

    // → Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    // Wait for grid reflow — breakpoint transition triggers re-render
    await page.waitForTimeout(500);
    await expect(page.getByText('Video Feed').first()).toBeVisible();

    // → Mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    // At sm breakpoint, panels stack vertically — scroll to check first panel
    await expect(page.getByText('Video Feed').first()).toBeVisible({
      timeout: 10000,
    });

    // → Back to Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(500);
    await expect(page.getByText('Video Feed').first()).toBeVisible();
    await expect(page.getByText('LiDAR View').first()).toBeVisible();

    // No infinite growth after roundtrip
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox).not.toBeNull();
    expect(bodyBox.height).toBeLessThan(2000);
  });

  // -------------------------------------------------------------------------
  // Map view responsive behavior
  // -------------------------------------------------------------------------

  test('map view: responsive resize works without crash', async ({ page }) => {
    await page.goto('/robot-telemetry-dashboard/map');

    // Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByText('Map View').first()).toBeVisible();

    // → Tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Map View').first()).toBeVisible();

    // → Back to Desktop
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByText('Map View').first()).toBeVisible();

    // No crash
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox).not.toBeNull();
    expect(bodyBox.height).toBeLessThan(2000);
  });
});
