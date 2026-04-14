import type { Page, WebSocketRoute } from '@playwright/test';

import topicListFixture from '../fixtures/topic-list.json' with { type: 'json' };
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

    ws.onMessage((raw) => {
      const msg = JSON.parse(raw as string) as RosbridgeMessage;

      switch (msg.op) {
        case 'call_service': {
          const svc = msg.service?.replace(/^\//, '') ?? '';
          if (svc === 'rosapi/topics') {
            ws.send(JSON.stringify({ ...topicListFixture, id: msg.id }));
          }
          break;
        }
        case 'subscribe': {
          const topic = msg.topic ?? '';
          subscriptions.add(topic);
          const resolver = pendingSubscriptions.get(topic);
          if (resolver) {
            pendingSubscriptions.delete(topic);
            resolver();
          }
          break;
        }
        case 'unsubscribe': {
          subscriptions.delete(msg.topic ?? '');
          break;
        }
        // publish (client → server, e.g. cmd_vel) — no-op
        default:
          break;
      }
    });
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
