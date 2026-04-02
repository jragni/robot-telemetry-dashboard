import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { buildTwist } from '../helpers';
import { ZERO_TWIST } from '../constants';
import { useControlPublisher } from '../useControlPublisher';

vi.mock('roslib', () => ({
  Topic: vi.fn().mockImplementation(() => ({
    publish: vi.fn(),
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  })),
}));

describe('buildTwist', () => {
  it('forward sets positive linear.x', () => {
    const twist = buildTwist('forward', 0.5, 1.0);
    expect(twist.linear.x).toBe(0.5);
    expect(twist.linear.y).toBe(0);
    expect(twist.linear.z).toBe(0);
    expect(twist.angular.x).toBe(0);
    expect(twist.angular.y).toBe(0);
    expect(twist.angular.z).toBe(0);
  });

  it('backward sets negative linear.x', () => {
    const twist = buildTwist('backward', 0.5, 1.0);
    expect(twist.linear.x).toBe(-0.5);
    expect(twist.angular.z).toBe(0);
  });

  it('left sets positive angular.z', () => {
    const twist = buildTwist('left', 0.5, 1.0);
    expect(twist.linear.x).toBe(0);
    expect(twist.angular.z).toBe(1.0);
  });

  it('right sets negative angular.z', () => {
    const twist = buildTwist('right', 0.5, 1.0);
    expect(twist.linear.x).toBe(0);
    expect(twist.angular.z).toBe(-1.0);
  });

  it('stop returns ZERO_TWIST', () => {
    const twist = buildTwist('stop', 0.5, 1.0);
    expect(twist).toEqual(ZERO_TWIST);
    expect(twist.linear.x).toBe(0);
    expect(twist.angular.z).toBe(0);
  });

  it('applies custom velocity magnitudes', () => {
    const twist = buildTwist('forward', 0.75, 2.0);
    expect(twist.linear.x).toBe(0.75);

    const turnTwist = buildTwist('left', 0.75, 2.0);
    expect(turnTwist.angular.z).toBe(2.0);
  });
});

describe('useControlPublisher', () => {
  it('returns default velocity values', () => {
    const { result } = renderHook(() => useControlPublisher());

    expect(result.current.linearVelocity).toBe(0.15);
    expect(result.current.angularVelocity).toBe(0.39);
    expect(result.current.isActive).toBe(false);
  });

  it('calls onPublish with correct twist when direction starts', () => {
    const onPublish = vi.fn();
    const { result } = renderHook(() =>
      useControlPublisher({ onPublish }),
    );

    act(() => {
      result.current.handleDirectionStart('forward');
    });

    expect(onPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        linear: { x: 0.15, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      }),
    );
    expect(result.current.isActive).toBe(true);
  });

  it('sends zero twist on direction end', () => {
    const onPublish = vi.fn();
    const { result } = renderHook(() =>
      useControlPublisher({ onPublish }),
    );

    act(() => {
      result.current.handleDirectionStart('forward');
    });

    onPublish.mockClear();

    act(() => {
      result.current.handleDirectionEnd();
    });

    expect(onPublish).toHaveBeenCalledWith(ZERO_TWIST);
    expect(result.current.isActive).toBe(false);
  });

  it('sends zero twist on emergency stop', () => {
    const onPublish = vi.fn();
    const { result } = renderHook(() =>
      useControlPublisher({ onPublish }),
    );

    act(() => {
      result.current.handleDirectionStart('left');
    });

    onPublish.mockClear();

    act(() => {
      result.current.handleEmergencyStop();
    });

    expect(onPublish).toHaveBeenCalledWith(ZERO_TWIST);
    expect(result.current.isActive).toBe(false);
  });

  it('updates velocity values via handlers', () => {
    const { result } = renderHook(() => useControlPublisher());

    act(() => {
      result.current.handleLinearChange(0.5);
    });
    expect(result.current.linearVelocity).toBe(0.5);

    act(() => {
      result.current.handleAngularChange(1.5);
    });
    expect(result.current.angularVelocity).toBe(1.5);
  });

  it('stop direction sends zero twist and deactivates', () => {
    const onPublish = vi.fn();
    const { result } = renderHook(() =>
      useControlPublisher({ onPublish }),
    );

    act(() => {
      result.current.handleDirectionStart('stop');
    });

    expect(onPublish).toHaveBeenCalledWith(ZERO_TWIST);
    expect(result.current.isActive).toBe(false);
  });
});
