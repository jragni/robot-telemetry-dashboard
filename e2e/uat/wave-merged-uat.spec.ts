import { test, expect, type ConsoleMessage, type Page } from '@playwright/test';

const ROBOT_NAME = 'UAT-Bot';
// REQUIRED — trycloudflare tunnels are ephemeral; never carry a default that will rot.
// Tests skip when unset so a missing env doesn't manifest as a false promotion failure.
const ROBOT_URL = process.env.UAT_ROBOT_URL ?? '';

// Browser noise only. WebRTC errors are deliberately NOT filtered — this UAT exists in
// part to catch transport regressions.
const IGNORED_ERROR_PATTERNS: RegExp[] = [/favicon/i, /chrome-extension/i];

function recordConsoleErrors(page: Page): string[] {
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

// Belt-and-suspenders fixture cleanup. Playwright default chromium contexts are
// in-memory, but clearing storage explicitly per test means a future fixture change
// (storageState, persistent context) cannot silently let UAT-Bot leak between runs and
// turn "modal closed" into a false positive (addRobot returns null when the name exists,
// the modal closes instantly, and the test passes for the wrong reason).
async function clearAppStorage(page: Page) {
  await page.goto('fleet');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
}

test.describe('UAT — dev / uat / main promotion gate against the cloudflare robot', () => {
  test.skip(!ROBOT_URL, 'UAT_ROBOT_URL not set — skipping live-robot UAT');

  test('Landing page renders and is console-clean', async ({ page }) => {
    const errors = recordConsoleErrors(page);

    await page.goto('');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 });

    expect(errors, `landing console errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('Fleet empty state shows Add Robot CTA', async ({ page }) => {
    await clearAppStorage(page);
    await expect(page.getByRole('button', { name: /add robot/i }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('Connect to real robot, verify workspace + pilot + mobile viewport', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = recordConsoleErrors(page);

    // Precondition: fleet is provably empty so the "modal closes -> robot added" signal is real.
    await clearAppStorage(page);
    expect(
      await page.getByText(ROBOT_NAME).count(),
      'fleet not empty at test start — storage cleanup is broken',
    ).toBe(0);

    // 1. Add robot via the modal — exercises the Add Robot UI path end-to-end.
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
    await expect(page.getByText(/BATTERY/i).first()).toBeVisible({ timeout: 10_000 });
    await expect
      .poll(async () => page.locator('canvas').count(), { timeout: 15_000 })
      .toBeGreaterThanOrEqual(3);

    // 4. Liveness assertions (BLOCK fix from PR #127 review).
    //    Canvas presence does not prove the subscription pipeline is alive — assert a
    //    text-based signal that only changes when real messages arrive.
    //    (a) battery row eventually renders a percentage value (NOT the unknown "—").
    const batteryValue = page.getByText(/^\s*\d+\s*%\s*$/);
    await expect(
      batteryValue.first(),
      'battery percent never rendered — subscription pipeline likely broken',
    ).toBeVisible({ timeout: 15_000 });
    //    (b) uptime counter advances — proves the connection-uptime hook is ticking
    //    (this also implicitly proves the connection is held).
    const uptimeRow = page
      .getByText(/UPTIME/i)
      .first()
      .locator('..');
    const readUptime = async () => (await uptimeRow.textContent())?.trim() ?? '';
    const uptimeT0 = await readUptime();
    await expect.poll(readUptime, { timeout: 6_000, intervals: [400] }).not.toBe(uptimeT0);

    // 5. Pilot mode entry — covers PilotControls + the merged reconnect-in-controls UI.
    //    Both link and button affordances are accepted in case the UI evolves.
    const pilotLink = page.getByRole('link', { name: /pilot/i }).first();
    const pilotButton = page.getByRole('button', { name: /pilot mode|enter pilot/i }).first();
    const pilotLinkCount = await pilotLink.count();
    if (pilotLinkCount > 0) {
      await pilotLink.click();
    } else {
      await pilotButton.click();
    }
    await page.waitForURL(/\/pilot\//, { timeout: 10_000 });
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10_000 });
    await page.goBack();
    await page.waitForURL(/\/robot\//, { timeout: 10_000 });

    // 6. Mobile viewport reflow check.
    await page.setViewportSize({ width: 375, height: 812 });
    await expect
      .poll(
        async () =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        { timeout: 3_000 },
      )
      .toBeLessThanOrEqual(0);

    // 7. mobile-sm (320) sanity.
    await page.setViewportSize({ width: 320, height: 600 });
    await expect
      .poll(
        async () =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        { timeout: 3_000 },
      )
      .toBeLessThanOrEqual(0);

    // 8. Reset viewport; final assert that no console error accumulated across the run.
    await page.setViewportSize({ width: 1280, height: 800 });
    expect(errors, `UAT console errors:\n${errors.join('\n')}`).toEqual([]);
  });
});
