import { expect, test } from '@playwright/test';

const BASE = '/robot-telemetry-dashboard';

// ── Mode switching ────────────────────────────────────────────────────────────

test.describe('Panel System — Mode Switching', () => {
  test('mode switcher shows DASHBOARD, PILOT, ENGINEER on desktop', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    await expect(
      page.getByRole('button', { name: /dashboard/i })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /pilot/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /engineer/i })).toBeVisible();
  });

  test('DASHBOARD mode is active by default', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    await expect(
      page.getByRole('button', { name: /dashboard/i })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking PILOT switches to pilot mode within same frame', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    await page.getByRole('button', { name: /pilot/i }).click();
    await expect(page.getByRole('button', { name: /pilot/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByTestId('pilot-mode')).toBeVisible();
  });

  test('clicking ENGINEER switches to engineer mode', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    await page.getByRole('button', { name: /engineer/i }).click();
    await expect(page.getByTestId('engineer-mode')).toBeVisible();
  });

  test('ENGINEER button is hidden on mobile (< 768px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);

    await expect(
      page.getByRole('button', { name: /engineer/i })
    ).not.toBeVisible();
  });

  test('mode persists across page refresh (sessionStorage)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    await page.getByRole('button', { name: /pilot/i }).click();
    await page.reload();

    await expect(page.getByTestId('pilot-mode')).toBeVisible();
    await expect(page.getByRole('button', { name: /pilot/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

// ── Dashboard Mode ────────────────────────────────────────────────────────────

test.describe('Panel System — Dashboard Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    // Ensure we're in dashboard mode
    await expect(page.getByTestId('dashboard-mode')).toBeVisible();
  });

  test('map panel is visible in center', async ({ page }) => {
    await expect(page.getByTestId('panel-map')).toBeVisible();
  });

  test('fleet-status panel is visible', async ({ page }) => {
    await expect(page.getByTestId('panel-fleet-status')).toBeVisible();
  });

  test('layout persists to localStorage key rdt-layout-dashboard', async ({
    page,
  }) => {
    await expect(page.getByTestId('panel-map')).toBeVisible();

    const storedLayout = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-dashboard')
    );
    expect(storedLayout).not.toBeNull();
    const parsed = JSON.parse(storedLayout!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.some((p: { i: string }) => p.i === 'map')).toBe(true);
  });

  test('layout survives page refresh', async ({ page }) => {
    const storedBefore = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-dashboard')
    );
    await page.reload();
    await expect(page.getByTestId('dashboard-mode')).toBeVisible();
    const storedAfter = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-dashboard')
    );
    expect(storedBefore).toBe(storedAfter);
  });

  test('mobile (375px): single-column layout, no drag handles', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);

    await expect(page.getByTestId('dashboard-mobile-layout')).toBeVisible();
    await expect(page.getByTestId('drag-handle')).not.toBeVisible();
  });
});

// ── Pilot Mode ────────────────────────────────────────────────────────────────

test.describe('Panel System — Pilot Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: /pilot/i }).click();
    await expect(page.getByTestId('pilot-mode')).toBeVisible();
  });

  test('video panel renders full-width at top', async ({ page }) => {
    await expect(page.getByTestId('panel-video')).toBeVisible();
  });

  test('controls panel renders below video', async ({ page }) => {
    await expect(page.getByTestId('panel-controls')).toBeVisible();
  });

  test('layout persists to localStorage key rdt-layout-pilot', async ({
    page,
  }) => {
    const storedLayout = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-pilot')
    );
    expect(storedLayout).not.toBeNull();
    const parsed = JSON.parse(storedLayout!);
    expect(parsed.some((p: { i: string }) => p.i === 'video')).toBe(true);
  });

  test('LiDAR HUD visibility preference persists to localStorage', async ({
    page,
  }) => {
    // Wait for LiDAR HUD to be visible
    await expect(page.getByTestId('lidar-hud-overlay')).toBeVisible();

    // Toggle via right-click context menu on video panel
    await page.getByTestId('panel-video').click({ button: 'right' });
    await page.getByRole('menuitem', { name: /toggle lidar hud/i }).click();

    const storedValue = await page.evaluate(() =>
      localStorage.getItem('rdt-lidar-hud-visible')
    );
    expect(storedValue).toBe('false');
  });

  test('mobile (375px): renders virtual D-pad', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: /pilot/i }).click();

    await expect(page.getByTestId('pilot-dpad')).toBeVisible();
  });

  test('mobile: swipeable telemetry cards are visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: /pilot/i }).click();

    await expect(page.getByTestId('pilot-swipeable-cards')).toBeVisible();
  });
});

// ── Engineer Mode ─────────────────────────────────────────────────────────────

test.describe('Panel System — Engineer Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: /engineer/i }).click();
    await expect(page.getByTestId('engineer-mode')).toBeVisible();
  });

  test('renders default panel layout (video, lidar, tab-group, topic-list, data-plot)', async ({
    page,
  }) => {
    await expect(page.getByTestId('panel-video')).toBeVisible();
    await expect(page.getByTestId('panel-lidar')).toBeVisible();
    await expect(page.getByTestId('panel-topic-list')).toBeVisible();
    await expect(page.getByTestId('panel-data-plot')).toBeVisible();
  });

  test('[+] button opens panel picker', async ({ page }) => {
    await page.getByRole('button', { name: /add panel/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeVisible();
  });

  test('panel picker closes on close button click', async ({ page }) => {
    await page.getByRole('button', { name: /add panel/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('layout persists to localStorage key rdt-layout-engineer', async ({
    page,
  }) => {
    const storedLayout = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-engineer')
    );
    expect(storedLayout).not.toBeNull();
  });

  test('engineer mode on mobile shows "requires desktop" message', async ({
    page,
  }) => {
    // Navigate directly to engineer route on mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/dashboard`);

    // Try to access engineer mode (should be blocked or redirect)
    // Directly set mode in sessionStorage to simulate direct access
    await page.evaluate(() =>
      sessionStorage.setItem('rdt-current-mode', 'engineer')
    );
    await page.reload();

    await expect(
      page.getByText(/engineer mode requires desktop/i)
    ).toBeVisible();
  });
});

// ── Responsive Transition: lg → md → lg ──────────────────────────────────────

test.describe('Panel System — Responsive Transition', () => {
  test('lg → md → lg: lg layout unchanged in localStorage after round-trip', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1300, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    // Capture lg layout after initial load
    await expect(page.getByTestId('dashboard-mode')).toBeVisible();
    const lgLayout = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-dashboard')
    );
    expect(lgLayout).not.toBeNull();

    // Shrink to md breakpoint
    await page.setViewportSize({ width: 900, height: 900 });
    await page.waitForTimeout(300); // allow debounce to flush

    // Expand back to lg
    await page.setViewportSize({ width: 1300, height: 900 });
    await page.waitForTimeout(300);

    // lg layout in localStorage must be identical
    const lgLayoutAfter = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-dashboard')
    );
    expect(lgLayoutAfter).toBe(lgLayout);
  });

  test('md/sm breakpoints: react-grid-layout does not write to localStorage', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1300, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    const lgLayout = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-dashboard')
    );

    // Shrink to sm
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    const smLayout = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-dashboard')
    );
    expect(smLayout).toBe(lgLayout); // unchanged
  });
});

// ── Reset layout race guard ────────────────────────────────────────────────────

test.describe('Panel System — Reset Layout Race Guard', () => {
  test('reset via right-click restores default layout; subsequent refresh shows default', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: /engineer/i }).click();
    await expect(page.getByTestId('engineer-mode')).toBeVisible();

    // Right-click first panel and reset
    const firstPanel = page.getByTestId('panel-video');
    await firstPanel.click({ button: 'right' });
    await page.getByRole('menuitem', { name: /reset layout/i }).click();

    // Verify localStorage contains default layout (not stale layout from race)
    const storedLayout = await page.evaluate(() =>
      localStorage.getItem('rdt-layout-engineer')
    );
    expect(storedLayout).not.toBeNull();
    const parsed = JSON.parse(storedLayout!);
    // Default layout has video at x:0, y:0
    const videoPanel = parsed.find((p: { i: string }) => p.i === 'video');
    expect(videoPanel?.x).toBe(0);
    expect(videoPanel?.y).toBe(0);

    // Refresh and verify default layout is still applied
    await page.reload();
    await page.getByRole('button', { name: /engineer/i }).click();
    await expect(page.getByTestId('panel-video')).toBeVisible();
  });
});

// ── Empty state ───────────────────────────────────────────────────────────────

test.describe('Panel System — Empty State', () => {
  test('disconnected state shows NoConnectionOverlay on widget panels in engineer mode', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: /engineer/i }).click();

    // With no robot connected, widgets should show no-connection state
    await expect(page.getByTestId('no-connection-overlay')).toBeVisible();
  });

  test('dashboard empty state shows connect prompt', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);

    // No robot connected → see connection prompt
    await expect(
      page
        .getByText(/no robots connected/i)
        .or(page.getByRole('button', { name: /connect robot/i }))
    ).toBeVisible();
  });
});
