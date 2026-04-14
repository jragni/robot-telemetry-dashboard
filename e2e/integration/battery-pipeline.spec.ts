import { expect, test } from '@playwright/test';

import { seedTestRobot } from '../smoke/helpers';
import { createFakeRosbridge } from '../helpers/fake-rosbridge';
import batteryFixtures from '../fixtures/battery-1hz-3sec.json' with { type: 'json' };
import type { RosbridgeMessage } from '../helpers/fake-rosbridge.types';

test.describe('Battery data pipeline', () => {
  test('battery percentage updates in SystemStatusPanel after fixture replay', async ({ page }) => {
    // 1. Set up fake rosbridge BEFORE navigation
    const rosbridge = await createFakeRosbridge(page);

    // 2. Seed a test robot and navigate to workspace
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    // 3. Click "Connect" to initiate WebSocket connection
    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();

    // 4. Wait for the client to subscribe to the battery topic
    await rosbridge.waitForSubscription('/battery_state', 10000);

    // 5. Send the first battery fixture message (85% charging)
    rosbridge.send(batteryFixtures[0] as RosbridgeMessage);

    // 6. Assert the UI updates — battery should show "85%"
    const batteryValue = page.locator('text=85%');
    await expect(batteryValue).toBeVisible({ timeout: 5000 });

    // 7. Send the third message (80% discharging) to verify updates
    rosbridge.send(batteryFixtures[2] as RosbridgeMessage);

    const updatedValue = page.locator('text=80%');
    await expect(updatedValue).toBeVisible({ timeout: 5000 });
  });

  test('battery shows dash when connected but no data received', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    // Connect so the BATTERY row renders
    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();
    await rosbridge.waitForSubscription('/battery_state', 10000);

    // BATTERY row should show "—" when connected but no messages have arrived
    const batteryLabel = page.getByText('BATTERY');
    await expect(batteryLabel).toBeVisible({ timeout: 5000 });

    // The dash value should be next to it
    const dashValue = page.getByText('—');
    await expect(dashValue.first()).toBeVisible();
  });
});
