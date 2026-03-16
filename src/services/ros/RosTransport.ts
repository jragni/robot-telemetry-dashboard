import ROSLIB from 'roslib';
import { BehaviorSubject, type Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

import { CONNECTION_CONFIG, ROSBRIDGE_PATH } from '@/config/ros';
import { createLogger } from '@/lib/logger';
import { useRosStore } from '@/stores';
import type { ConnectionError, ConnectionState } from '@/types';

const log = createLogger('RosTransport');

export class RosTransport {
  private readonly robotId: string;
  private rosInstance: ROSLIB.Ros | null = null;
  private readonly connectionState$$ = new BehaviorSubject<ConnectionState>(
    'disconnected'
  );
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private currentUrl: string | null = null;

  constructor(robotId: string) {
    this.robotId = robotId;
    log.debug(`RosTransport created for robot "${robotId}"`);
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  connect(url: string): void {
    if (this.destroyed) {
      log.warn('connect() called on a destroyed RosTransport — ignoring');
      return;
    }

    this.currentUrl = url;
    this.retryCount = 0;
    this.clearRetryTimer();

    this.createConnection(url);
  }

  disconnect(): void {
    log.info(`Disconnecting robot "${this.robotId}"`);
    // Mark a deliberate disconnect so that any in-flight 'close' event fired
    // by ros.close() does not schedule a reconnect.
    this.currentUrl = null;
    this.clearRetryTimer();
    this.closeRosInstance();
    this.setState('disconnected');
  }

  destroy(): void {
    if (this.destroyed) return;

    log.info(`Destroying RosTransport for robot "${this.robotId}"`);
    this.destroyed = true;
    this.currentUrl = null;
    this.clearRetryTimer();
    this.closeRosInstance();
    this.setState('disconnected');
    this.connectionState$$.complete();
  }

  getConnectionState$(): Observable<ConnectionState> {
    return this.connectionState$$.pipe(distinctUntilChanged());
  }

  getCurrentState(): ConnectionState {
    return this.connectionState$$.getValue();
  }

  getRosInstance(): ROSLIB.Ros {
    if (this.rosInstance === null || this.getCurrentState() !== 'connected') {
      throw new Error(
        `RosTransport[${this.robotId}]: no active connection — current state is "${this.getCurrentState()}"`
      );
    }
    return this.rosInstance;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private createConnection(url: string): void {
    const wsUrl = `${url}${ROSBRIDGE_PATH}`;
    log.info(`Connecting to ${wsUrl} (attempt ${this.retryCount + 1})`);

    this.rosInstance = new ROSLIB.Ros({ url: wsUrl });
    this.attachHandlers();
    this.setState('connecting');
  }

  private attachHandlers(): void {
    if (!this.rosInstance) return;

    this.rosInstance.on('connection', () => this.handleConnected());
    this.rosInstance.on('error', (event: unknown) => this.handleError(event));
    this.rosInstance.on('close', () => this.handleClose());
  }

  private handleConnected(): void {
    log.info(`Robot "${this.robotId}" connected`);
    this.retryCount = 0;
    this.clearRetryTimer();
    this.setState('connected', null);
  }

  private handleError(event: unknown): void {
    const message =
      event instanceof Error
        ? event.message
        : typeof event === 'string'
          ? event
          : 'Unknown ROS connection error';

    log.error(`Robot "${this.robotId}" connection error: ${message}`);

    const connectionError: ConnectionError = {
      message,
      code: 'ROS_ERROR',
      timestamp: Date.now(),
    };

    // Increment retryCount and decide whether we can still attempt a reconnect.
    // maxReconnectAttempts is the total number of retries (not counting the
    // initial connection), so once we've used all of them the next failure goes
    // straight to 'disconnected'.
    this.retryCount += 1;
    const retriesExhausted =
      this.retryCount >= CONNECTION_CONFIG.maxReconnectAttempts;

    if (retriesExhausted) {
      log.warn(
        `Robot "${this.robotId}" exhausted ${CONNECTION_CONFIG.maxReconnectAttempts} reconnect attempts`
      );
      this.setState('disconnected', connectionError);
    } else {
      this.setState('error', connectionError);
      this.scheduleReconnect();
    }
  }

  private handleClose(): void {
    // Deliberate disconnects set currentUrl to null before closing so we skip
    // the reconnect here.
    if (!this.currentUrl || this.destroyed) return;

    log.warn(
      `Robot "${this.robotId}" connection closed — scheduling reconnect`
    );
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.destroyed) return;

    log.info(
      `Scheduling reconnect attempt ${this.retryCount}/${CONNECTION_CONFIG.maxReconnectAttempts} ` +
        `in ${CONNECTION_CONFIG.reconnectInterval}ms`
    );

    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (this.destroyed || !this.currentUrl) return;
      this.createConnection(this.currentUrl);
    }, CONNECTION_CONFIG.reconnectInterval);
  }

  private clearRetryTimer(): void {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private closeRosInstance(): void {
    if (this.rosInstance) {
      try {
        this.rosInstance.close();
      } catch {
        // Closing a socket that is already closed can throw in some environments
      }
      this.rosInstance = null;
    }
  }

  /**
   * Update the local BehaviorSubject and mirror state into the Zustand store.
   *
   * @param state      New connection state.
   * @param error      When provided, also updates the error entry in the store.
   *                   Pass `null` explicitly to clear a previous error.
   *                   Omit entirely to leave the current error untouched.
   */
  private setState(
    state: ConnectionState,
    error?: ConnectionError | null
  ): void {
    this.connectionState$$.next(state);

    const store = useRosStore.getState();
    store.setConnectionState(this.robotId, state);

    if (error !== undefined) {
      store.setConnectionError(this.robotId, error);
    }
  }
}
