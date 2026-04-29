import { expect, test } from '@playwright/test';

import { createFakeRosbridge } from '../helpers/fake-rosbridge';
import type { RosbridgeMessage } from '../helpers/fake-rosbridge.types';
import imuFixtures from '../fixtures/imu-10hz-1sec.json' with { type: 'json' };
import lidarFixtures from '../fixtures/lidar-5hz-1sec.json' with { type: 'json' };
import { seedTestRobot } from '../smoke/helpers';

test.describe('Canvas content assertions', () => {
  test('LiDAR panel renders points after receiving scan data', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/scan', 10000);

    rosbridge.send(lidarFixtures[0] as RosbridgeMessage);

    const lidarCanvas = page.locator('[aria-label*="LiDAR scan"]');
    await expect(lidarCanvas).toHaveAttribute('aria-label', /45 points/, { timeout: 5000 });

    await expect(page).toHaveScreenshot('lidar-with-data.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('IMU panel renders orientation after receiving IMU data', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/imu/data', 10000);

    // Send message with roll ~20° (quaternion x=0.174, w=0.985)
    rosbridge.send(imuFixtures[2] as RosbridgeMessage);

    const imuVisual = page.locator('[aria-label*="roll"]');
    await expect(imuVisual.first()).toHaveAttribute('aria-label', /roll 20/, { timeout: 5000 });

    await expect(page).toHaveScreenshot('imu-with-data.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('LiDAR panel shows empty state before data arrives', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/scan', 10000);

    // Before any data is sent, the LiDAR panel should show 0 points
    const lidarCanvas = page.locator('[aria-label*="LiDAR scan"]');
    await expect(lidarCanvas).toHaveAttribute('aria-label', /0 points/, { timeout: 5000 });
    await expect(page.getByText(/PTS\s+0/)).toBeVisible({ timeout: 5000 });
  });
});
