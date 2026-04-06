import { useEffect, useRef, useState } from 'react';
import { Topic } from 'roslib';

import { VELOCITY_LIMITS } from '@/constants/controls';
import type { Direction } from '@/types/control.types';

import { DEFAULT_PUBLISH_RATE, ZERO_TWIST } from './constants';
import { buildTwist } from './helpers';
import type { UseControlPublisherOptions, UseControlPublisherReturn } from './types';

/** useControlPublisher
 * @description Publishes geometry_msgs/msg/Twist commands to a ROS topic at a fixed rate.
 *  Manages velocity state, interval-based publishing, and emergency stop.
 * @param options - Publisher configuration including ros instance, topic, and publish rate.
 */
export function useControlPublisher(
  options: UseControlPublisherOptions = {},
): UseControlPublisherReturn {
  const { publishRate = DEFAULT_PUBLISH_RATE, onPublish, ros, topicName = '/cmd_vel' } = options;
  const intervalMs = Math.round(1000 / publishRate);

  const linearDefault: number = VELOCITY_LIMITS.linear.default;
  const angularDefault: number = VELOCITY_LIMITS.angular.default;
  const [linearVelocity, setLinearVelocity] = useState(linearDefault);
  const [angularVelocity, setAngularVelocity] = useState(angularDefault);
  const [isActive, setIsActive] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const topicRef = useRef<Topic | null>(null);
  const onPublishRef = useRef(onPublish);
  const linearRef = useRef(linearVelocity);
  const angularRef = useRef(angularVelocity);

  // Create/destroy roslib Topic when ros or topicName changes
  useEffect(() => {
    if (!ros) {
      topicRef.current = null;
      return;
    }
    topicRef.current = new Topic({
      ros,
      name: topicName,
      messageType: 'geometry_msgs/msg/Twist',
    });
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      topicRef.current?.publish(ZERO_TWIST);
      onPublishRef.current?.(ZERO_TWIST);
      topicRef.current = null;
    };
  }, [ros, topicName]);

  useEffect(() => {
    onPublishRef.current = onPublish;
  }, [onPublish]);
  useEffect(() => {
    linearRef.current = linearVelocity;
  }, [linearVelocity]);
  useEffect(() => {
    angularRef.current = angularVelocity;
  }, [angularVelocity]);

  function publish(twist: typeof ZERO_TWIST) {
    onPublishRef.current?.(twist);
    topicRef.current?.publish(twist);
  }

  function stop() {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    publish(ZERO_TWIST);
  }

  function handleDirectionStart(direction: Direction) {
    if (direction === 'stop') {
      setIsActive(false);
      stop();
      return;
    }
    stop();
    setIsActive(true);
    publish(buildTwist(direction, linearRef.current, angularRef.current));
    timerRef.current = setInterval(() => {
      publish(buildTwist(direction, linearRef.current, angularRef.current));
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
