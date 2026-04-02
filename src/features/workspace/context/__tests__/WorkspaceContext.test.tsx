import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { WorkspaceProvider } from '../WorkspaceContext';
import { useWorkspaceContext } from '../useWorkspaceContext';
import type { WorkspaceContextValue } from '../../types/WorkspaceContext.types';
import { createRef } from 'react';

function createMockValue(overrides?: Partial<WorkspaceContextValue>): WorkspaceContextValue {
  return {
    robotId: 'robot-1',
    robotName: 'Test Robot',
    robotUrl: 'ws://localhost:9090',
    connected: true,
    status: 'connected',
    lastSeen: Date.now(),
    onConnect: vi.fn(),
    onDisconnect: vi.fn(),
    videoRef: createRef<HTMLVideoElement | null>(),
    selectedCameraTopic: '/camera/image_raw',
    lidarPoints: [],
    lidarRangeMax: 30,
    uptimeSeconds: 120,
    battery: null,
    rosGraph: null,
    imuRoll: 0,
    imuPitch: 0,
    imuYaw: 0,
    telemetrySeries: [],
    telemetryTimeWindowMs: 30000,
    selectedTopics: { camera: '/camera/image_raw' },
    filteredTopics: {},
    onTopicChange: vi.fn(),
    ...overrides,
  };
}

describe('WorkspaceContext', () => {
  it('throws when useWorkspaceContext is called outside a provider', () => {
    expect(() => {
      renderHook(() => useWorkspaceContext());
    }).toThrow('useWorkspaceContext must be used within a WorkspaceProvider');
  });

  it('returns the provided value inside a provider', () => {
    const mockValue = createMockValue({ robotId: 'bot-42', robotName: 'Rover' });

    const { result } = renderHook(() => useWorkspaceContext(), {
      wrapper: ({ children }) => (
        <WorkspaceProvider value={mockValue}>{children}</WorkspaceProvider>
      ),
    });

    expect(result.current.robotId).toBe('bot-42');
    expect(result.current.robotName).toBe('Rover');
    expect(result.current.connected).toBe(true);
  });

  it('provides all workspace fields to children', () => {
    const mockValue = createMockValue({
      imuRoll: 1.5,
      imuPitch: -0.3,
      imuYaw: 2.1,
      uptimeSeconds: 999,
      lidarRangeMax: 50,
    });

    const { result } = renderHook(() => useWorkspaceContext(), {
      wrapper: ({ children }) => (
        <WorkspaceProvider value={mockValue}>{children}</WorkspaceProvider>
      ),
    });

    expect(result.current.imuRoll).toBe(1.5);
    expect(result.current.imuPitch).toBe(-0.3);
    expect(result.current.imuYaw).toBe(2.1);
    expect(result.current.uptimeSeconds).toBe(999);
    expect(result.current.lidarRangeMax).toBe(50);
  });
});
