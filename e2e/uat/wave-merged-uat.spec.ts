import { test, expect, type ConsoleMessage } from '@playwright/test';

const ROBOT_NAME = 'UAT-Bot';
// Override with UAT_ROBOT_URL env var when the tunnel rotates: trycloudflare URLs are ephemeral.
const ROBOT_URL =
  process.env.UAT_ROBOT_URL ?? 'https://sample-suggesting-presentations-project.trycloudflare.com';

// Errors we expect to ignore — third-party / browser noise, not regressions.
const IGNORED_ERROR_PATTERNS: RegExp[] = [
  /favicon/i,
  /chrome-extension/i,
  /\bWebRTC\b.*candidate/i,
];

function recordConsoleErrors(page: import('@playwright/test').Page): string[] {
  const errors: string[] = [];
  page.on('console', (m: ConsoleMessage) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if (IGNORED_ERROR_PATTERNS.some((re) => re.test(text))) return;
    errors.push(text);
  });
  page.on('pageerror', (e) => {
    const text = e.message;
    if (IGNORED_ERROR_PATTERNS.some((re) => re.test(text))) return;
    errors.push(`[pageerror] ${text}`);
  });
  return errors;
}

test.describe('UAT — dev / uat / main promotion gate against the cloudflare robot', () => {
  test('Landing page renders and is console-clean', async ({ page }) => {
    const errors = recordConsoleErrors(page);

    await page.goto('');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });

    expect(errors, `landing console errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('Fleet empty state shows Add Robot CTA', async ({ page }) => {
    await page.goto('fleet');
    await expect(page.getByRole('button', { name: /add robot/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('Connect to real robot, verify workspace + pilot + mobile viewport', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = recordConsoleErrors(page);

    // 1. Add robot via the modal — exercises the Add Robot UI path end-to-end.
    await page.goto('fleet');
    await page
      .getByRole('button', { name: /add robot/i })
      .first()
      .click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel(/robot name/i).fill(ROBOT_NAME);
    await dialog.getByLabel(/rosbridge url/i).fill(ROBOT_URL);
    await dialog.getByRole('button', { name: /^add robot$/i }).click();

    // testConnectionWithRetries can take up to ~30s (3 attempts x 10s each, no backoff).
    // Successful submit closes the modal and the robot card renders with a View link.
    await expect(dialog).not.toBeVisible({ timeout: 45_000 });
    const viewLink = page.getByRole('link', { name: /view/i }).first();
    await expect(viewLink).toBeVisible({ timeout: 10_000 });

    // 2. Open the robot workspace.
    await viewLink.click();
    await page.waitForURL(/\/robot\//, { timeout: 10_000 });

    // 3. Discovery completes within ~10s of connecting (auto-fill from empty defaults).
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });

    // 4. Each panel surface present.
    await expect(page.getByText(/BATTERY/i).first()).toBeVisible({ timeout: 10_000 });
    // IMU / LiDAR / Telemetry render via canvas; expect at least 3 canvases on workspace.
    await expect
      .poll(async () => page.locator('canvas').count(), { timeout: 15_000 })
      .toBeGreaterThanOrEqual(3);

    // 5. Sustain data flow briefly so the per-RAF coalescing actually runs on the hot path.
    await page.waitForTimeout(4_000);
    const canvasCount = await page.locator('canvas').count();
    expect(canvasCount, 'workspace should render multiple canvas panels').toBeGreaterThanOrEqual(3);

    // 6. Pilot mode entry — covers PilotControls + the merged reconnect-in-controls UI.
    const pilotLink = page.getByRole('link', { name: /pilot/i }).first();
    const pilotButton = page.getByRole('button', { name: /pilot mode|enter pilot/i }).first();
    if (await pilotLink.count()) {
      await pilotLink.click();
    } else {
      await pilotButton.click();
    }
    await page.waitForURL(/\/pilot\//, { timeout: 10_000 });
    // Pilot view should render at least one canvas (LiDAR minimap or wireframe).
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10_000 });
    // Sustain pilot view briefly to verify no console errors under live IMU / LiDAR feed.
    await page.waitForTimeout(2_000);
    await page.goBack();
    await page.waitForURL(/\/robot\//, { timeout: 10_000 });

    // 7. Mobile viewport reflow check.
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    const pageOverflowMobile = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(pageOverflowMobile, 'mobile page-level horizontal overflow').toBeLessThanOrEqual(0);

    // 8. mobile-sm (320) sanity.
    await page.setViewportSize({ width: 320, height: 600 });
    await page.waitForTimeout(500);
    const pageOverflowSm = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(pageOverflowSm, 'mobile-sm page-level horizontal overflow').toBeLessThanOrEqual(0);

    // 9. Reset viewport, sustain telemetry briefly to confirm long-running stability.
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(3_000);

    expect(errors, `UAT console errors:\n${errors.join('\n')}`).toEqual([]);
  });
});
