import { expect, test } from '@playwright/test';

const BASE = '/robot-telemetry-dashboard';

// Helper: set the mode store to pilot on the dashboard page
async function switchToPilotMode(page: import('@playwright/test').Page) {
  // The mode switcher is hidden on mobile, so we drive the store directly
  await page.evaluate(() => {
    // Access Zustand store via the window.useModeStore devtools if available,
    // or by dispatching a custom event the app handles.
    // For tests, we can set the store via Zustand's vanilla API if exposed,
    // or trigger the mode switch by temporarily widening the viewport.
    (window as unknown as Record<string, unknown>).__setTestMode?.('pilot');
  });

  // Fallback: temporarily switch to desktop viewport to click the mode button,
  // then return to mobile
  await page.setViewportSize({ width: 1440, height: 900 });
  const pilotBtn = page.getByRole('button', { name: /pilot/i });
  if (await pilotBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await pilotBtn.click();
  }
  await page.setViewportSize({ width: 375, height: 812 });
}

test.describe('Mobile UX (375x812)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);
  });

  // ── Fix 5: Mode switcher header hidden on mobile ─────────────────────────

  test('mode switcher header is hidden on mobile', async ({ page }) => {
    // On mobile, the mode-switcher-header div is not rendered (not just hidden)
    await expect(page.getByTestId('mode-switcher-header')).not.toBeAttached();
  });

  // ── Fix 2: Engineer mode hidden on mobile ────────────────────────────────

  test('engineer mode button hidden on mobile', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /engineer/i })
    ).not.toBeVisible();
  });

  // ── Fix 2: Engineer guard on viewport resize ─────────────────────────────

  test('navigating to engineer on desktop then resizing to mobile shows dashboard', async ({
    page,
  }) => {
    // Start on desktop, switch to engineer
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    // Click engineer mode button (visible on desktop)
    const engineerBtn = page.getByRole('button', { name: /engineer/i });
    await expect(engineerBtn).toBeVisible();
    await engineerBtn.click();

    // Engineer button should now be active (aria-pressed=true)
    await expect(engineerBtn).toHaveAttribute('aria-pressed', 'true');

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 812 });

    // On mobile, the engineer guard kicks in — DashboardMode should render
    // The map panel is a reliable indicator of DashboardMode being shown
    await expect(page.getByTestId('dashboard-mode')).toBeVisible();

    // The engineer grid panels should NOT appear on mobile
    await expect(page.getByTestId('panel-engineer-map')).not.toBeAttached();
  });

  // ── Fix 1 & 4: Carousel replaces overflow div; fills available height ────

  test('pilot mobile view shows carousel after switching mode', async ({
    page,
  }) => {
    await switchToPilotMode(page);

    await expect(page.getByTestId('pilot-mobile-carousel')).toBeVisible();
    await expect(page.getByTestId('pilot-swipeable-cards')).not.toBeAttached();
  });

  test('pilot carousel dot indicators are present', async ({ page }) => {
    await switchToPilotMode(page);

    await expect(page.getByTestId('pilot-mobile-carousel-dots')).toBeVisible();
    const firstDot = page.getByTestId('pilot-mobile-dot-0');
    await expect(firstDot).toBeVisible();
  });

  test('no large empty gap between content and bottom bar', async ({
    page,
  }) => {
    await switchToPilotMode(page);

    const carousel = page.getByTestId('pilot-mobile-carousel');
    await expect(carousel).toBeVisible();

    const carouselBox = await carousel.boundingBox();
    const bottomBar = page.getByRole('navigation', {
      name: 'Mobile navigation',
    });
    const bottomBarBox = await bottomBar.boundingBox();

    expect(carouselBox).not.toBeNull();
    expect(bottomBarBox).not.toBeNull();

    // The gap between carousel bottom and bottom bar top should be < 16px
    const gap = (bottomBarBox?.y ?? 0) - (carouselBox!.y + carouselBox!.height);
    expect(gap).toBeLessThan(16);
  });

  // ── Fix 3: Compact mobile controls ──────────────────────────────────────

  test('pilot controls have 44px+ touch targets on mobile', async ({
    page,
  }) => {
    await switchToPilotMode(page);

    // Navigate to controls card (card 1 via dot)
    const dot1 = page.getByTestId('pilot-mobile-dot-1');
    if (await dot1.isVisible({ timeout: 2000 }).catch(() => false)) {
      await dot1.click();
    }

    const forwardBtn = page.getByRole('button', { name: /forward/i });
    await expect(forwardBtn).toBeVisible();

    const box = await forwardBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  });

  test('E-stop button is full width on mobile', async ({ page }) => {
    await switchToPilotMode(page);

    const eStopBtn = page.getByTestId('e-stop-button');
    await expect(eStopBtn).toBeVisible();

    const box = await eStopBtn.boundingBox();
    // Full-width means at least 300px on a 375px viewport (accounting for padding)
    expect(box?.width).toBeGreaterThan(300);
  });

  test('no horizontal overflow on controls at 375px', async ({ page }) => {
    await switchToPilotMode(page);

    // Check scrollWidth doesn't exceed clientWidth (no horizontal overflow)
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});
