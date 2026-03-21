import { expect, test } from '@playwright/test';

const BASE = '/robot-telemetry-dashboard';

test.describe('Robot Control — Pilot Mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    // Switch to Pilot mode
    await page.getByRole('button', { name: /pilot/i }).click();
    await expect(page.getByTestId('pilot-mode')).toBeVisible();
  });

  test('controls panel renders actual ControlWidget (not placeholder)', async ({
    page,
  }) => {
    // Should NOT show the placeholder text
    await expect(
      page.getByText(/robot controls.*coming in phase/i)
    ).not.toBeVisible();

    // Should show actual E-Stop button
    await expect(page.getByRole('button', { name: /e-stop/i })).toBeVisible();
  });

  test('E-Stop button is visible on the LEFT side of controls', async ({
    page,
  }) => {
    const eStopBtn = page.getByRole('button', { name: /e-stop/i });
    await expect(eStopBtn).toBeVisible();

    // Get bounding boxes
    const eStopBox = await eStopBtn.boundingBox();
    const forwardBtn = page.getByRole('button', { name: /forward/i });
    const forwardBox = await forwardBtn.boundingBox();

    // E-Stop should be to the LEFT of the directional pad
    expect(eStopBox?.x).toBeLessThan(forwardBox?.x ?? 0);
  });

  test('direction buttons are visible and interactive', async ({ page }) => {
    await expect(page.getByRole('button', { name: /forward/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /backward/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /left/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /right/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^stop$/i })).toBeVisible();
  });

  test('E-Stop click disables direction buttons', async ({ page }) => {
    await page.getByRole('button', { name: /e-stop/i }).click();

    // Direction buttons should be disabled after e-stop
    await expect(page.getByRole('button', { name: /forward/i })).toBeDisabled();
    await expect(
      page.getByRole('button', { name: /backward/i })
    ).toBeDisabled();
    await expect(page.getByRole('button', { name: /left/i })).toBeDisabled();
    await expect(page.getByRole('button', { name: /right/i })).toBeDisabled();
  });

  test('E-Stop shows active banner when engaged', async ({ page }) => {
    await page.getByRole('button', { name: /e-stop/i }).click();
    await expect(page.getByText(/e-stop active/i)).toBeVisible();
  });

  test('velocity sliders are present', async ({ page }) => {
    await expect(page.getByRole('slider', { name: /linear/i })).toBeVisible();
    await expect(page.getByRole('slider', { name: /angular/i })).toBeVisible();
  });

  test('topic selector dropdown is present', async ({ page }) => {
    await expect(page.getByRole('combobox')).toBeVisible();
  });
});

test.describe('Robot Control — Mobile viewport', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard at desktop width first so the mode switcher is visible,
    // click Pilot mode, then shrink to mobile. Fix 5 hides the mode switcher on
    // mobile, so we must switch mode before narrowing the viewport.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: /pilot/i }).click();
    await page.setViewportSize({ width: 375, height: 812 });
  });

  test('controls are visible on mobile and not clipped', async ({ page }) => {
    // Controls are in carousel card 1 — navigate there via the dot indicator
    const dot1 = page.getByTestId('pilot-mobile-dot-1');
    await expect(dot1).toBeVisible();
    await dot1.click();

    const eStop = page.getByRole('button', { name: /e-stop/i });
    await expect(eStop).toBeVisible();

    // Wait for carousel scroll animation to settle
    await page.waitForFunction(
      () => {
        const btn = document.querySelector('[data-testid="e-stop-button"]');
        if (!btn) return false;
        const rect = btn.getBoundingClientRect();
        return rect.x >= 0 && rect.x + rect.width <= 376;
      },
      { timeout: 3000 }
    );

    const box = await eStop.boundingBox();
    expect(box).not.toBeNull();
    // Button should be within viewport
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(375 + 1);
  });

  test('direction buttons have minimum 48px touch target', async ({ page }) => {
    const forwardBtn = page.getByRole('button', { name: /forward/i });
    await expect(forwardBtn).toBeVisible();
    const box = await forwardBtn.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(48);
    expect(box?.height).toBeGreaterThanOrEqual(48);
  });
});

test.describe('Robot Control — No robot connected', () => {
  test('controls disabled when no robot connected', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/dashboard`);
    await page.getByRole('button', { name: /pilot/i }).click();
    await expect(page.getByTestId('pilot-mode')).toBeVisible();

    // If no robot is connected, overlay should appear
    // (This test verifies the "Connect a robot" overlay or disabled state)
    const connectOverlay = page.getByText(/connect a robot/i);
    const eStopBtn = page.getByRole('button', { name: /e-stop/i });

    // Either the overlay is shown OR direction buttons are disabled
    const hasOverlay = await connectOverlay.isVisible().catch(() => false);
    const hasDisabledForward = await page
      .getByRole('button', { name: /forward/i })
      .isDisabled()
      .catch(() => true);

    expect(hasOverlay || hasDisabledForward).toBe(true);

    // E-Stop itself should always be visible
    await expect(eStopBtn).toBeVisible();
  });
});
