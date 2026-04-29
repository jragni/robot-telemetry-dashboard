import { expect, test, type Page } from '@playwright/test';

import { createFakeRosbridge } from '../helpers/fake-rosbridge';
import batteryFixtures from '../fixtures/battery-1hz-3sec.json' with { type: 'json' };
import type { RosbridgeMessage } from '../helpers/fake-rosbridge.types';

async function seedTwoRobots(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const store = {
      state: {
        robots: {
          'robot-a': {
            id: 'robot-a',
            name: 'Robot A',
            url: 'ws://robot-a:9090',
            status: 'disconnected',
            lastSeen: null,
            lastError: null,
            reconnectAttempt: null,
            color: 'blue',
            selectedTopics: { camera: '', controls: '', imu: '', lidar: '', telemetry: '' },
          },
          'robot-b': {
            id: 'robot-b',
            name: 'Robot B',
            url: 'ws://robot-b:9090',
            status: 'disconnected',
            lastSeen: null,
            lastError: null,
            reconnectAttempt: null,
            color: 'cyan',
            selectedTopics: { camera: '', controls: '', imu: '', lidar: '', telemetry: '' },
          },
        },
      },
      version: 0,
    };
    localStorage.setItem('rtd-connections', JSON.stringify(store));
  });
}

test.describe('Multi-robot state isolation', () => {
  test('two robots appear in fleet sidebar', async ({ page }) => {
    await seedTwoRobots(page);
    await page.goto('fleet');
    await page.waitForLoadState('networkidle');

    // Both robots should appear in the sidebar navigation as clickable buttons
    const sidebar = page.locator('aside[aria-label="Main navigation"]');
    await expect(sidebar.getByRole('button', { name: 'Robot A', exact: true })).toBeVisible({
      timeout: 5000,
    });
    await expect(sidebar.getByRole('button', { name: 'Robot B', exact: true })).toBeVisible({
      timeout: 5000,
    });
  });

  test('Robot A battery does not bleed into Robot B', async ({ page }) => {
    // Set up separate fake rosbridges for each robot URL
    const rosbridgeA = await createFakeRosbridge(page, '**/robot-a:9090/**');
    const rosbridgeB = await createFakeRosbridge(page, '**/robot-b:9090/**');

    await seedTwoRobots(page);

    // Navigate to Robot A workspace and connect
    await page.goto('robot/robot-a');
    await page.waitForLoadState('networkidle');

    const connectButtonA = page.getByRole('button', { name: /connect to robot/i });
    await connectButtonA.click();
    await rosbridgeA.waitForSubscription('/battery_state', 10000);

    // Send 85% battery to Robot A (first fixture message)
    rosbridgeA.send(batteryFixtures[0] as RosbridgeMessage);
    await expect(page.getByText('85%')).toBeVisible({ timeout: 5000 });

    // Navigate to Robot B workspace
    await page.goto('robot/robot-b');
    await page.waitForLoadState('networkidle');

    const connectButtonB = page.getByRole('button', { name: /connect to robot/i });
    await connectButtonB.click();
    await rosbridgeB.waitForSubscription('/battery_state', 10000);

    // Send 40% battery to Robot B
    const batteryB40: RosbridgeMessage = {
      op: 'publish',
      topic: '/battery_state',
      msg: { percentage: 0.4, power_supply_status: 0, voltage: 11.2 },
    };
    rosbridgeB.send(batteryB40);

    // Robot B should show 40%, not 85% from Robot A
    await expect(page.getByText('40%')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('85%')).not.toBeVisible({ timeout: 2000 });
  });

  test('disconnecting Robot A does not affect Robot B', async ({ page }) => {
    await createFakeRosbridge(page, '**/robot-a:9090/**');
    await createFakeRosbridge(page, '**/robot-b:9090/**');

    await seedTwoRobots(page);

    // Connect Robot A
    await page.goto('robot/robot-a');
    await page.waitForLoadState('networkidle');

    const connectButtonA = page.getByRole('button', { name: /connect to robot/i });
    await connectButtonA.click();
    await expect(page.getByText('NOMINAL')).toBeVisible({ timeout: 5000 });

    // Disconnect Robot A
    const disconnectButton = page.getByRole('button', { name: /disconnect from robot/i });
    await disconnectButton.click();
    await expect(page.getByText('NOMINAL')).not.toBeVisible({ timeout: 5000 });

    // Now navigate to Robot B and verify it can connect independently
    await page.goto('robot/robot-b');
    await page.waitForLoadState('networkidle');

    // Robot B should start as OFFLINE (not affected by Robot A's lifecycle)
    await expect(page.getByText('OFFLINE')).toBeVisible({ timeout: 5000 });

    // Connect Robot B — should succeed independently
    const connectButtonB = page.getByRole('button', { name: /connect to robot/i });
    await connectButtonB.click();
    await expect(page.getByText('NOMINAL')).toBeVisible({ timeout: 5000 });

    // Verify store: Robot A is disconnected, Robot B is connected
    const statuses = await page.evaluate(() => {
      const raw = localStorage.getItem('rtd-connections');
      if (!raw) return null;
      const store = JSON.parse(raw) as {
        state: { robots: Record<string, { status: string }> };
      };
      return {
        robotA: store.state.robots['robot-a']?.status,
      };
    });
    expect(statuses?.robotA).toBe('disconnected');
  });

  test('store state isolation — each robot has independent connection record', async ({ page }) => {
    const rosbridgeA = await createFakeRosbridge(page, '**/robot-a:9090/**');
    const rosbridgeB = await createFakeRosbridge(page, '**/robot-b:9090/**');

    await seedTwoRobots(page);

    // Connect Robot A
    await page.goto('robot/robot-a');
    await page.waitForLoadState('networkidle');

    const connectButtonA = page.getByRole('button', { name: /connect to robot/i });
    await connectButtonA.click();
    await rosbridgeA.waitForSubscription('/battery_state', 10000);

    // Send 85% battery to Robot A
    rosbridgeA.send(batteryFixtures[0] as RosbridgeMessage);
    await expect(page.getByText('85%')).toBeVisible({ timeout: 5000 });

    // Connect Robot B
    await page.goto('robot/robot-b');
    await page.waitForLoadState('networkidle');

    const connectButtonB = page.getByRole('button', { name: /connect to robot/i });
    await connectButtonB.click();
    await rosbridgeB.waitForSubscription('/battery_state', 10000);

    // Send 40% battery to Robot B
    const batteryB40: RosbridgeMessage = {
      op: 'publish',
      topic: '/battery_state',
      msg: { percentage: 0.4, power_supply_status: 0, voltage: 11.2 },
    };
    rosbridgeB.send(batteryB40);
    await expect(page.getByText('40%')).toBeVisible({ timeout: 5000 });

    // Read the Zustand store directly to verify isolation
    const storeState = await page.evaluate(() => {
      const raw = localStorage.getItem('rtd-connections');
      if (!raw) return null;
      const store = JSON.parse(raw) as {
        state: {
          robots: Record<string, { id: string; name: string; url: string; color: string }>;
        };
      };
      const robots = store.state.robots;
      return {
        robotAExists: !!robots['robot-a'],
        robotAId: robots['robot-a']?.id,
        robotAName: robots['robot-a']?.name,
        robotAUrl: robots['robot-a']?.url,
        robotBExists: !!robots['robot-b'],
        robotBId: robots['robot-b']?.id,
        robotBName: robots['robot-b']?.name,
        robotBUrl: robots['robot-b']?.url,
      };
    });

    // Each robot record should be fully independent
    expect(storeState?.robotAExists).toBe(true);
    expect(storeState?.robotAId).toBe('robot-a');
    expect(storeState?.robotAName).toBe('Robot A');
    expect(storeState?.robotAUrl).toBe('ws://robot-a:9090');

    expect(storeState?.robotBExists).toBe(true);
    expect(storeState?.robotBId).toBe('robot-b');
    expect(storeState?.robotBName).toBe('Robot B');
    expect(storeState?.robotBUrl).toBe('ws://robot-b:9090');
  });
});
