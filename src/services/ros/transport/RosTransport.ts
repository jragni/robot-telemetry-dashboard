import { BehaviorSubject } from 'rxjs';

import type { IRos } from './ros.types';

import { ROS_CONFIG } from '@/config/ros';
import type { ConnectionState } from '@/shared/types/connection.types';

export interface RosTransportOptions {
  robotId: string;
  url: string;
  rosFactory: () => IRos;
  maxReconnectAttempts?: number;
  baseReconnectIntervalMs?: number;
  backoffMultiplier?: number;
}

export class RosTransport {
  readonly robotId: string;
  readonly connectionState$ = new BehaviorSubject<ConnectionState>(
    'disconnected'
  );

  readonly url: string;
  private readonly rosFactory: () => IRos;
  private readonly maxReconnectAttempts: number;
  private readonly baseReconnectIntervalMs: number;
  private readonly backoffMultiplier: number;

  private ros: IRos;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;
  private intentionalDisconnect = false;

  constructor(options: RosTransportOptions) {
    this.robotId = options.robotId;
    this.url = options.url;
    this.rosFactory = options.rosFactory;
    this.maxReconnectAttempts =
      options.maxReconnectAttempts ?? ROS_CONFIG.reconnect.maxAttempts;
    this.baseReconnectIntervalMs =
      options.baseReconnectIntervalMs ?? ROS_CONFIG.reconnect.baseIntervalMs;
    this.backoffMultiplier =
      options.backoffMultiplier ?? ROS_CONFIG.reconnect.backoffMultiplier;

    this.ros = this.rosFactory();
    this.setupListeners();
  }

  connect(): void {
    if (this.destroyed) return;

    const currentState = this.connectionState$.getValue();
    if (currentState === 'connected' || currentState === 'connecting') return;

    this.intentionalDisconnect = false;
    this.connectionState$.next('connecting');
    this.ros.connect();
  }

  disconnect(): void {
    if (this.destroyed) return;

    const currentState = this.connectionState$.getValue();
    if (currentState === 'disconnected') return;

    this.intentionalDisconnect = true;
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    this.ros.close();
  }

  destroy(): void {
    this.destroyed = true;
    this.intentionalDisconnect = true;
    this.clearReconnectTimer();
    this.reconnectAttempts = 0;
    this.ros.removeAllListeners();
    if (this.ros.isConnected) {
      this.ros.close();
    }
    this.connectionState$.next('disconnected');
  }

  getRos(): IRos {
    return this.ros;
  }

  private setupListeners(): void {
    this.ros.on('connection', () => {
      if (this.destroyed) return;
      this.reconnectAttempts = 0;
      this.connectionState$.next('connected');
    });

    this.ros.on('error', (_error: unknown) => {
      if (this.destroyed) return;
      this.connectionState$.next('error');
    });

    this.ros.on('close', () => {
      if (this.destroyed) return;

      if (this.intentionalDisconnect) {
        this.connectionState$.next('disconnected');
        return;
      }

      // Unexpected close — attempt reconnect
      this.attemptReconnect();
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Max attempts exhausted, stay in current state
      return;
    }

    this.connectionState$.next('connecting');
    const delay =
      this.baseReconnectIntervalMs *
      Math.pow(this.backoffMultiplier, this.reconnectAttempts);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      if (this.destroyed) return;
      this.ros.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
