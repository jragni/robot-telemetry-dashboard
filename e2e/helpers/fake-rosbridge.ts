import type { Page, WebSocketRoute } from '@playwright/test';

import topicListFixture from '../fixtures/topic-list.json';
import type { FakeRosbridgeController, RosbridgeMessage } from './fake-rosbridge.types';

/**
 * createFakeRosbridge
 *
 * Intercepts WebSocket connections to the rosbridge URL and returns
 * a controller for injecting messages and simulating failures.
 *
 * @param page - Playwright page instance.
 * @param url - WebSocket URL pattern to intercept (default: all ws:// connections).
 */
export async function createFakeRosbridge(
  page: Page,
  url = '**/*',
): Promise<FakeRosbridgeController> {
  const subscriptions = new Set<string>();
  let activeRoute: WebSocketRoute | null = null;
  const pendingSubscriptions = new Map<string, () => void>();
  const activeTimers: ReturnType<typeof setInterval>[] = [];

  await page.routeWebSocket(url, (ws) => {
    activeRoute = ws;

    // TODO: You implement this.
    //
    // ws.onMessage(handler) — called when the client (roslib) sends a message.
    // Parse the rosbridge protocol op and route accordingly:
    //
    // - op: "call_service" with service "/rosapi/topics"
    //     → respond with topicListFixture via ws.send()
    //
    // - op: "subscribe"
    //     → track the topic in subscriptions Set
    //     → resolve any pending waitForSubscription promises
    //
    // - op: "unsubscribe"
    //     → remove the topic from subscriptions Set
    //
    // - op: "publish" (client publishing, e.g. cmd_vel)
    //     → ignore (or log for debugging)
    //
    // Hint: messages arrive as strings. JSON.parse them to read the op field.
  });

  function send(message: RosbridgeMessage): void {
    activeRoute?.send(JSON.stringify(message));
  }

  function replay(messages: RosbridgeMessage[], intervalMs: number): void {
    let index = 0;
    const timer = setInterval(() => {
      if (index >= messages.length) {
        clearInterval(timer);
        return;
      }
      const msg = messages[index];
      if (msg && subscriptions.has(msg.topic ?? '')) {
        send(msg);
      }
      index++;
    }, intervalMs);
    activeTimers.push(timer);
  }

  function burst(messages: RosbridgeMessage[]): void {
    for (const msg of messages) {
      if (subscriptions.has(msg.topic ?? '')) {
        send(msg);
      }
    }
  }

  function sendMalformed(): void {
    activeRoute?.send('NOT_VALID_JSON{{{');
  }

  function close(): void {
    for (const timer of activeTimers) clearInterval(timer);
    activeTimers.length = 0;
    activeRoute?.close();
    activeRoute = null;
  }

  function waitForSubscription(topic: string, timeoutMs = 5000): Promise<void> {
    if (subscriptions.has(topic)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Timed out waiting for subscription to ${topic}`)),
        timeoutMs,
      );
      pendingSubscriptions.set(topic, () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  return {
    get subscriptions() {
      return subscriptions as ReadonlySet<string>;
    },
    send,
    replay,
    burst,
    sendMalformed,
    close,
    waitForSubscription,
  };
}
