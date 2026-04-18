import { expect, test } from '@playwright/test';

import { createFakeRosbridge } from '../helpers/fake-rosbridge';
import imuFixtures from '../fixtures/imu-10hz-1sec.json' with { type: 'json' };
import lidarFixtures from '../fixtures/lidar-5hz-1sec.json' with { type: 'json' };
import { seedTestRobot } from '../smoke/helpers';
import type { RosbridgeMessage } from '../helpers/fake-rosbridge.types';

/**
 * Extracts a named metric value from the CDP Performance.getMetrics response.
 */
function getMetric(metrics: Array<{ name: string; value: number }>, name: string): number {
  return metrics.find((m) => m.name === name)?.value ?? 0;
}

/**
 * Generates a looping stream of fixture messages to sustain replay
 * beyond the original fixture length.
 */
function generateSustainedMessages(
  fixtures: RosbridgeMessage[],
  count: number,
): RosbridgeMessage[] {
  const messages: RosbridgeMessage[] = [];
  for (let i = 0; i < count; i++) {
    messages.push(fixtures[i % fixtures.length] as RosbridgeMessage);
  }
  return messages;
}

test.describe('Performance regression guard', () => {
  test('LayoutCount stays low during sustained telemetry', async ({ page }) => {
    test.slow();

    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();

    await Promise.all([
      rosbridge.waitForSubscription('/imu/data', 10000),
      rosbridge.waitForSubscription('/scan', 10000),
    ]);

    // Capture baseline layout count via CDP
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');

    const { metrics: before } = await client.send('Performance.getMetrics');
    const layoutCountBefore = getMetric(before, 'LayoutCount');

    // Replay IMU at 100ms (10Hz) and LiDAR at 200ms (5Hz) for 5 seconds.
    // Generate enough messages to cover the full duration.
    const imuMessages = generateSustainedMessages(imuFixtures as RosbridgeMessage[], 50);
    const lidarMessages = generateSustainedMessages(lidarFixtures as RosbridgeMessage[], 25);

    rosbridge.replay(imuMessages, 100);
    rosbridge.replay(lidarMessages, 200);

    await page.waitForTimeout(5000);

    const { metrics: after } = await client.send('Performance.getMetrics');
    const layoutCountAfter = getMetric(after, 'LayoutCount');
    const layoutDelta = layoutCountAfter - layoutCountBefore;

    // Canvas updates via RAF should not trigger DOM layout.
    // Generous threshold for CI environments.
    expect(layoutDelta, `LayoutCount delta was ${layoutDelta}`).toBeLessThan(200);
  });

  test('message burst does not freeze the UI', async ({ page }) => {
    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();

    await rosbridge.waitForSubscription('/scan', 10000);

    // Build 50 LiDAR messages for the burst
    const burstMessages = generateSustainedMessages(lidarFixtures as RosbridgeMessage[], 50);

    // Start a PerformanceObserver for long tasks before the burst
    await page.evaluate(() => {
      (window as unknown as Record<string, unknown[]>).__longTasks = [];
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as unknown as Record<string, unknown[]>).__longTasks.push({
            duration: entry.duration,
            name: entry.name,
          });
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    });

    const timeBefore = await page.evaluate(() => performance.now());

    // Send all 50 messages in a single burst
    rosbridge.burst(burstMessages);

    // Give the page time to process the burst
    await page.waitForTimeout(2000);

    const timeAfter = await page.evaluate(() => performance.now());
    const elapsed = timeAfter - timeBefore;

    // The page should remain responsive. The elapsed time measured
    // from evaluate calls includes round-trip overhead, so we use a
    // generous threshold. The key assertion is that the main thread
    // was not blocked for an unreasonable duration.
    expect(elapsed, 'main thread was blocked too long').toBeLessThan(10000);

    // Check that no excessively long tasks occurred (>500ms)
    const longTasks = await page.evaluate(
      () => (window as unknown as Record<string, unknown[]>).__longTasks,
    );

    const extremeLongTasks = (longTasks as Array<{ duration: number }>).filter(
      (t) => t.duration > 500,
    );
    expect(extremeLongTasks.length, `Found ${extremeLongTasks.length} tasks >500ms`).toBe(0);
  });

  test('sustained data flow does not cause memory leak indicators', async ({ page }) => {
    test.slow();

    const rosbridge = await createFakeRosbridge(page);
    await seedTestRobot(page);
    await page.goto('robot/testbot-01');
    await page.waitForLoadState('networkidle');

    const connectButton = page.getByRole('button', { name: /connect to robot/i });
    await connectButton.click();

    await Promise.all([
      rosbridge.waitForSubscription('/imu/data', 10000),
      rosbridge.waitForSubscription('/scan', 10000),
    ]);

    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');

    // Force initial GC to get a clean baseline
    await client.send('HeapProfiler.collectGarbage');
    await page.waitForTimeout(500);

    const { metrics: before } = await client.send('Performance.getMetrics');
    const heapBefore = getMetric(before, 'JSHeapUsedSize');

    // Replay data for 5 seconds
    const imuMessages = generateSustainedMessages(imuFixtures as RosbridgeMessage[], 50);
    const lidarMessages = generateSustainedMessages(lidarFixtures as RosbridgeMessage[], 25);

    rosbridge.replay(imuMessages, 100);
    rosbridge.replay(lidarMessages, 200);

    await page.waitForTimeout(5000);

    // Force GC before measuring to avoid counting reclaimable garbage
    await client.send('HeapProfiler.collectGarbage');
    await page.waitForTimeout(500);

    const { metrics: after } = await client.send('Performance.getMetrics');
    const heapAfter = getMetric(after, 'JSHeapUsedSize');

    const heapDeltaMB = (heapAfter - heapBefore) / (1024 * 1024);

    // Heap growth should stay under 5MB for 5 seconds of telemetry.
    // This threshold is generous to account for CI variance.
    expect(heapDeltaMB, `Heap grew by ${heapDeltaMB.toFixed(2)}MB`).toBeLessThan(5);
  });
});
