import { useEffect, useRef, useState } from 'react';
import type { Direction } from '@/types/control.types';
import { VELOCITY_LIMITS } from '@/features/workspace/constants';
import type { UseControlPublisherOptions, UseControlPublisherReturn } from './types';
import { ZERO_TWIST, DEFAULT_PUBLISH_RATE } from './constants';
import { buildTwist } from './helpers';

/** useControlPublisher
 * @description Publishes TwistMessage commands at a fixed rate while a
 *  direction button is held. Sends zero velocity on release. Uses
 *  setInterval internally — refs bridge React state into the timer
 *  callback so slider changes take effect mid-press.
 * @param options - Optional publish rate and callback.
 * @returns Control state and handlers for ControlsPanel.
 */
export function useControlPublisher(
  options: UseControlPublisherOptions = {},
): UseControlPublisherReturn {
  const { publishRate = DEFAULT_PUBLISH_RATE, onPublish } = options;
  const intervalMs = Math.round(1000 / publishRate);

  const linearDefault: number = VELOCITY_LIMITS.linear.default;
  const angularDefault: number = VELOCITY_LIMITS.angular.default;
  const [linearVelocity, setLinearVelocity] = useState(linearDefault);
  const [angularVelocity, setAngularVelocity] = useState(angularDefault);
  const [isActive, setIsActive] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onPublishRef = useRef(onPublish);
  const linearRef = useRef(linearVelocity);
  const angularRef = useRef(angularVelocity);

  useEffect(() => {
    onPublishRef.current = onPublish;
  }, [onPublish]);
  useEffect(() => {
    linearRef.current = linearVelocity;
  }, [linearVelocity]);
  useEffect(() => {
    angularRef.current = angularVelocity;
  }, [angularVelocity]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  function stop() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onPublishRef.current?.(ZERO_TWIST);
  }

  function handleDirectionStart(direction: Direction) {
    if (direction === 'stop') {
      setIsActive(false);
      stop();
      return;
    }
    stop();
    setIsActive(true);
    onPublishRef.current?.(buildTwist(direction, linearRef.current, angularRef.current));
    timerRef.current = setInterval(() => {
      onPublishRef.current?.(buildTwist(direction, linearRef.current, angularRef.current));
    }, intervalMs);
  }

  function handleDirectionEnd() {
    setIsActive(false);
    stop();
  }

  return {
    linearVelocity,
    angularVelocity,
    isActive,
    handleDirectionStart,
    handleDirectionEnd,
    handleEmergencyStop: handleDirectionEnd,
    handleLinearChange: setLinearVelocity,
    handleAngularChange: setAngularVelocity,
  };
}
