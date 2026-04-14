import { expect, test } from '@playwright/test';

import { seedTestRobot } from '../smoke/helpers';
import { createFakeRosbridge } from '../helpers/fake-rosbridge';
import imuFixtures from '../fixtures/imu-10hz-1sec.json' with { type: 'json' };
import type { RosbridgeMessage } from '../helpers/fake-rosbridge.types';

test.describe('IMU data pipeline', () => {
  test('IMU panel updates roll/pitch values after receiving messages', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    // Connect to robot
    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/imu/data', 10000);

    // Send first message — identity quaternion (roll=0, pitch=0, yaw=0)
    rosbridge.send(imuFixtures[0] as RosbridgeMessage);

    // IMU panel should show 0° values
    const rollZero = page.getByText('0°');
    await expect(rollZero.first()).toBeVisible({ timeout: 5000 });

    // Send second message — roll ~10° (quaternion x=0.087, w=0.996)
    rosbridge.send(imuFixtures[1] as RosbridgeMessage);

    // Roll should update to 10°
    const rollTen = page.getByText('10°');
    await expect(rollTen.first()).toBeVisible({ timeout: 5000 });
  });

  test('IMU panel shows wireframe aria-label with orientation values', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/imu/data', 10000);

    // Send message with roll ~20° (quaternion x=0.174, w=0.985)
    rosbridge.send(imuFixtures[2] as RosbridgeMessage);

    // The wireframe or attitude indicator should have an accessible label with the angles
    const imuVisual = page.locator('[aria-label*="roll"]');
    await expect(imuVisual.first()).toBeVisible({ timeout: 5000 });
  });

  test('replays multiple IMU messages at 10Hz', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/imu/data', 10000);

    // Replay all 10 IMU messages at 100ms intervals (10Hz)
    rosbridge.replay(imuFixtures as RosbridgeMessage[], 100);

    // Wait for replay to finish (10 messages * 100ms = 1 second)
    await page.waitForTimeout(1500);

    // After replay, the last message has quaternion (0, 0.087, 0, 0.996) — pitch ~10°
    // Verify the panel processed the stream without crashing
    const imuVisual = page.locator('[aria-label*="roll"]');
    await expect(imuVisual.first()).toBeVisible();
  });
});
