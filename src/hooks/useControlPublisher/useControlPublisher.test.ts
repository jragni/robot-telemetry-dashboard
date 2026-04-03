import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import type { Ros } from 'roslib';
import { ZERO_TWIST } from './constants';
import { useControlPublisher } from './useControlPublisher';

const { mockPublish } = vi.hoisted(() => {
  const mockPublish = vi.fn();
  return { mockPublish };
});

vi.mock('roslib', () => ({
  Topic: class MockTopic {
    publish = mockPublish;
  },
}));

function createMockRos(): Ros {
  return {} as unknown as Ros;
}

describe('useControlPublisher', () => {
  beforeEach(() => {
    mockPublish.mockClear();
  });

  // Verify that useEffect cleanup runs on unmount in this environment
  it('sanity: useEffect cleanup runs on unmount', () => {
    const cleanupFn = vi.fn();
    const { unmount } = renderHook(() => {
      useEffect(() => {
        return cleanupFn;
      }, []);
    });

    unmount();
    console.log('cleanup called:', cleanupFn.mock.calls.length);
  });

  // Test with a ref-based approach like the hook uses
  it('sanity: ref-based cleanup works', () => {
    const publishFn = vi.fn();
    const { unmount } = renderHook(() => {
      const ref = useRef({ publish: publishFn });
      useEffect(() => {
        return () => {
          ref.current.publish('cleanup');
        };
      }, []);
    });

    unmount();
    console.log('ref publish called:', publishFn.mock.calls.length);
  });
});
