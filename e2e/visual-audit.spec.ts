import { expect, test } from '@playwright/test';

// ISS-002: Dark theme activation
test('html element has dark class', async ({ page }) => {
  await page.goto('/robot-telemetry-dashboard/dashboard');
  const html = page.locator('html');
  await expect(html).toHaveClass(/dark/);
});

// ISS-002: Body background is dark
test('background is dark (not white)', async ({ page }) => {
  await page.goto('/robot-telemetry-dashboard/dashboard');
  const bg = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor
  );
  // Dark bg should have low RGB values (not 255,255,255)
  expect(bg).not.toBe('rgb(255, 255, 255)');
});

// ISS-003: Sidebar dark surface
test('sidebar background is dark (not white)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/robot-telemetry-dashboard/dashboard');
  const aside = page.locator('aside[aria-label="Sidebar"]');
  const bg = await aside.evaluate((el) => getComputedStyle(el).backgroundColor);
  // Sidebar must not render white/near-white
  expect(bg).not.toBe('rgb(255, 255, 255)');
  // RGB values must all be below 100 (dark surface)
  const match = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    expect(r).toBeLessThan(100);
    expect(g).toBeLessThan(100);
    expect(b).toBeLessThan(100);
  }
});

// ISS-006: Robot controls panel visible in viewport
test('robot controls panel is in viewport (no below-fold clipping)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/robot-telemetry-dashboard/dashboard');
  await page.getByRole('button', { name: 'Pilot' }).click();
  const panel = page.locator('[data-testid="panel-robot-controls"]');
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  // Panel bottom edge must be within viewport height
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
});

// ISS-006: Video panel visible in viewport
test('video panel is visible in viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/robot-telemetry-dashboard/dashboard');
  await page.getByRole('button', { name: 'Pilot' }).click();
  const panel = page.locator('[data-testid="panel-video"]');
  await expect(panel).toBeVisible();
  await expect(panel).toBeInViewport();
});

// ISS-005: Active mode switcher button uses monospace font
test('active mode switcher button uses monospace font', async ({ page }) => {
  await page.goto('/robot-telemetry-dashboard/dashboard');
  const activeBtn = page
    .getByRole('navigation', { name: 'Mode Switcher' })
    .getByRole('button', { pressed: true });
  const fontFamily = await activeBtn.evaluate(
    (el) => getComputedStyle(el).fontFamily
  );
  // Should contain a monospace font (Geist Mono or generic monospace)
  expect(fontFamily.toLowerCase()).toMatch(/mono/);
});

// ISS-004: Sovereign panel (video) has a primary-blue left border accent
test('sovereign video panel has primary-color left border accent', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/robot-telemetry-dashboard/dashboard');
  await page.getByRole('button', { name: 'Pilot' }).click();
  const panel = page.locator('[data-testid="panel-video"]');
  await expect(panel).toBeVisible();
  // The PanelFrame container is the direct child div inside the grid item
  const frame = panel.locator('> div').first();
  const borderLeftColor = await frame.evaluate(
    (el) => getComputedStyle(el).borderLeftColor
  );
  // Must not be transparent or the default border color (dark grey)
  // Primary is oklch(0.588 0.218 264.376) — a blue, so R < G < B or distinct from grey
  expect(borderLeftColor).not.toBe('rgba(0, 0, 0, 0)');
  // Parse RGB and confirm it's not a neutral grey (R ≈ G ≈ B)
  const match = borderLeftColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    // Blue-primary: B should be notably higher than R, not a grey
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    expect(maxDiff).toBeGreaterThan(20);
  }
});
