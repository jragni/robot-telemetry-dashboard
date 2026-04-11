import { expect, type Locator, type Page } from '@playwright/test';

/** expectNoOverflow
 * @description Asserts an element does not overflow its own scrollable bounds.
 *  Catches clipped content (hidden below fold, out of viewport, etc.).
 * @param locator - Playwright locator for the element to check.
 */
export async function expectNoOverflow(locator: Locator): Promise<void> {
  const overflow = await locator.evaluate((el) => ({
    scrollH: el.scrollHeight,
    clientH: el.clientHeight,
    scrollW: el.scrollWidth,
    clientW: el.clientWidth,
  }));
  // Allow 1px tolerance for subpixel rendering
  expect(overflow.scrollH, 'vertical overflow').toBeLessThanOrEqual(overflow.clientH + 1);
  expect(overflow.scrollW, 'horizontal overflow').toBeLessThanOrEqual(overflow.clientW + 1);
}

/** expectInViewport
 * @description Asserts an element is fully visible within the browser viewport.
 *  Catches content that renders but is positioned offscreen.
 * @param page - Playwright page instance.
 * @param locator - Playwright locator for the element to check.
 */
export async function expectInViewport(page: Page, locator: Locator): Promise<void> {
  const box = await locator.boundingBox();
  expect(box, 'element has bounding box').not.toBeNull();
  if (!box) return;
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) return;
  expect(box.x, 'not offscreen left').toBeGreaterThanOrEqual(0);
  expect(box.y, 'not offscreen top').toBeGreaterThanOrEqual(0);
  expect(box.x + box.width, 'not offscreen right').toBeLessThanOrEqual(viewport.width);
  expect(box.y + box.height, 'not offscreen bottom').toBeLessThanOrEqual(viewport.height);
}

/** collectConsoleErrors
 * @description Attaches a console error collector to a page. Returns the array that fills during navigation.
 * @param page - Playwright page instance.
 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });
  return errors;
}

/** seedTestRobot
 * @description Seeds a test robot in localStorage before navigation so workspace/pilot routes have data.
 * @param page - Playwright page instance.
 */
export async function seedTestRobot(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const store = {
      state: {
        robots: {
          'testbot-01': {
            id: 'testbot-01',
            name: 'TestBot 01',
            url: 'ws://localhost:9090',
            status: 'disconnected',
            lastSeen: null,
            lastError: null,
            reconnectAttempt: null,
            color: 'blue',
            selectedTopics: {
              camera: '/camera/image_raw',
              lidar: '/scan',
              imu: '/imu/data',
              controls: '/cmd_vel',
              telemetry: '/odom',
            },
          },
        },
      },
      version: 0,
    };
    localStorage.setItem('rtd-connections', JSON.stringify(store));
  });
}
