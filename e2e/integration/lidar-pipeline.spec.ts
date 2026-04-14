import { expect, test } from '@playwright/test';

import { seedTestRobot } from '../smoke/helpers';
import { createFakeRosbridge } from '../helpers/fake-rosbridge';
import lidarFixtures from '../fixtures/lidar-5hz-1sec.json' with { type: 'json' };
import type { RosbridgeMessage } from '../helpers/fake-rosbridge.types';

test.describe('LiDAR data pipeline', () => {
  test('LiDAR panel shows point count after receiving a scan', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/scan', 10000);

    // Send first LiDAR scan — 50 ranges, 5 nulls = 45 valid points
    rosbridge.send(lidarFixtures[0] as RosbridgeMessage);

    // The LiDAR panel aria-label updates with point count
    const lidarCanvas = page.locator('[aria-label*="LiDAR scan"]');
    await expect(lidarCanvas).toHaveAttribute('aria-label', /45 points/, { timeout: 5000 });
  });

  test('LiDAR panel updates point count on subsequent scans', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/scan', 10000);

    // Send first scan
    rosbridge.send(lidarFixtures[0] as RosbridgeMessage);
    const lidarCanvas = page.locator('[aria-label*="LiDAR scan"]');
    await expect(lidarCanvas).toHaveAttribute('aria-label', /45 points/, { timeout: 5000 });

    // Send second scan (same structure, slightly different ranges)
    rosbridge.send(lidarFixtures[1] as RosbridgeMessage);
    // Should still show 45 points (same null pattern)
    await expect(lidarCanvas).toHaveAttribute('aria-label', /45 points/, { timeout: 5000 });
  });

  test('LiDAR panel shows PTS count in panel footer', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/scan', 10000);

    // Send scan data
    rosbridge.send(lidarFixtures[0] as RosbridgeMessage);

    // The footer shows "PTS 45"
    const ptsLabel = page.getByText(/PTS\s+45/);
    await expect(ptsLabel).toBeVisible({ timeout: 5000 });
  });

  test('replays LiDAR scans at 5Hz without crashing', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/scan', 10000);

    // Replay 5 scans at 200ms intervals (5Hz)
    rosbridge.replay(lidarFixtures as RosbridgeMessage[], 200);

    // Wait for replay to finish
    await page.waitForTimeout(1500);

    // Panel should still be visible and showing data
    const lidarCanvas = page.locator('[aria-label*="LiDAR scan"]');
    await expect(lidarCanvas).toBeVisible();
    await expect(lidarCanvas).toHaveAttribute('aria-label', /\d+ points/);
  });
});
