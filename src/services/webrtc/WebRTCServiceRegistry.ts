import { WebRTCTransport } from './WebRTCTransport';

import { createLogger } from '@/lib/logger';
import { useWebRTCStore } from '@/stores/webrtc/webrtc.store';

const log = createLogger('WebRTCServiceRegistry');

export class WebRTCServiceRegistry {
  private transports = new Map<string, WebRTCTransport>();

  connect(robotId: string, baseUrl: string): void {
    if (this.transports.has(robotId)) {
      log.warn(`Transport already exists for ${robotId}, skipping`);
      return;
    }
    const transport = new WebRTCTransport(robotId);
    this.transports.set(robotId, transport);
    transport.connect(baseUrl);
  }

  disconnect(robotId: string): void {
    const transport = this.transports.get(robotId);
    if (!transport) {
      log.warn(`disconnect() called for unknown robotId "${robotId}" — no-op`);
      return;
    }
    transport.disconnect();
  }

  remove(robotId: string): void {
    const transport = this.transports.get(robotId);
    if (!transport) {
      log.warn(`remove() called for unknown robotId "${robotId}" — no-op`);
      return;
    }
    transport.destroy();
    this.transports.delete(robotId);
    useWebRTCStore.getState().removeConnection(robotId);
    log.info(`Removed transport for robot "${robotId}"`);
  }

  getTransport(robotId: string): WebRTCTransport {
    const transport = this.transports.get(robotId);
    if (!transport) {
      throw new Error(
        `WebRTCServiceRegistry: no transport registered for robotId "${robotId}"`
      );
    }
    return transport;
  }

  isConnected(robotId: string): boolean {
    const transport = this.transports.get(robotId);
    if (!transport) return false;
    return transport.getCurrentState() === 'connected';
  }

  destroyAll(): void {
    log.info(`Destroying all ${this.transports.size} transport(s)`);
    for (const [robotId, transport] of this.transports) {
      transport.destroy();
      log.debug(`Destroyed transport for robot "${robotId}"`);
    }
    this.transports.clear();
  }
}

export const webRTCServiceRegistry = new WebRTCServiceRegistry();
