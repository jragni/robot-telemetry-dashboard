import { expect, test } from '@playwright/test';

import { seedTestRobot } from '../smoke/helpers';
import { createFakeRosbridge } from '../helpers/fake-rosbridge';
import imuNullFixtures from '../fixtures/imu-null-fields.json' with { type: 'json' };
import lidarNullFixtures from '../fixtures/lidar-null-ranges.json' with { type: 'json' };
import lidarFixtures from '../fixtures/lidar-5hz-1sec.json' with { type: 'json' };
import imuFixtures from '../fixtures/imu-10hz-1sec.json' with { type: 'json' };
import type { RosbridgeMessage } from '../helpers/fake-rosbridge.types';

test.describe('Null message resilience (CBOR serialization)', () => {
  test('IMU panel handles null angular_velocity and linear_acceleration', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/imu/data', 10000);

    // Send message with null velocity/acceleration — should not crash
    rosbridge.send(imuNullFixtures[0] as RosbridgeMessage);
    await page.waitForTimeout(500);

    // Panel should still be visible (not error boundary)
    const imuVisual = page.locator('[aria-label*="roll"]');
    await expect(imuVisual.first()).toBeVisible({ timeout: 5000 });
  });

  test('IMU panel handles fully null orientation', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/imu/data', 10000);

    // Send message with ALL fields null — should default to identity quaternion
    rosbridge.send(imuNullFixtures[1] as RosbridgeMessage);
    await page.waitForTimeout(500);

    // Panel should show 0° values (identity quaternion)
    const zeroValue = page.getByText('0°');
    await expect(zeroValue.first()).toBeVisible({ timeout: 5000 });
  });

  test('IMU panel recovers after null message when valid data arrives', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/imu/data', 10000);

    // Send null message first
    rosbridge.send(imuNullFixtures[1] as RosbridgeMessage);
    await page.waitForTimeout(300);

    // Then send valid data — roll should update to 10°
    rosbridge.send(imuNullFixtures[2] as RosbridgeMessage);
    const rollValue = page.getByText('10°');
    await expect(rollValue.first()).toBeVisible({ timeout: 5000 });
  });

  test('LiDAR panel handles null ranges array', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/scan', 10000);

    // Send scan with null ranges — should show 0 points, not crash
    rosbridge.send(lidarNullFixtures[0] as RosbridgeMessage);
    await page.waitForTimeout(500);

    const lidarCanvas = page.locator('[aria-label*="LiDAR scan"]');
    await expect(lidarCanvas).toHaveAttribute('aria-label', /0 points/, { timeout: 5000 });
  });

  test('LiDAR panel recovers after null ranges when valid scan arrives', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/scan', 10000);

    // Send null ranges first
    rosbridge.send(lidarNullFixtures[0] as RosbridgeMessage);
    await page.waitForTimeout(300);

    // Then send valid scan — should show points
    rosbridge.send(lidarFixtures[0] as RosbridgeMessage);
    const lidarCanvas = page.locator('[aria-label*="LiDAR scan"]');
    await expect(lidarCanvas).toHaveAttribute('aria-label', /45 points/, { timeout: 5000 });
  });

  test('no console errors from null message parsing', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore network errors from WebRTC/resource loading — not related to message parsing
        if (text.includes('net::ERR_') || text.includes('Failed to load resource')) return;
        errors.push(text);
      }
    });
    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/imu/data', 10000);
    await rosbridge.waitForSubscription('/scan', 10000);

    // Send null messages for both IMU and LiDAR
    rosbridge.send(imuNullFixtures[1] as RosbridgeMessage);
    rosbridge.send(lidarNullFixtures[0] as RosbridgeMessage);
    await page.waitForTimeout(1000);

    // Then send valid messages
    rosbridge.send(imuFixtures[0] as RosbridgeMessage);
    rosbridge.send(lidarFixtures[0] as RosbridgeMessage);
    await page.waitForTimeout(1000);

    // No console errors should have occurred
    expect(errors, `console errors: ${errors.join('\n')}`).toHaveLength(0);
  });
});
