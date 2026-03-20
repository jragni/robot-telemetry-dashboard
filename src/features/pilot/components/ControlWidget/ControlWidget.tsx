import { useMemo, useRef } from 'react';
import ROSLIB from 'roslib';

import { useControlPublisher } from '../../hooks/useControlPublisher';
import { createControlStore } from '../../stores/controlStore';
import { zeroTwist } from '../../utils/twistBuilder';
import { ControlPad } from '../ControlPad/ControlPad';
import { EStop } from '../EStop/EStop';
import { TopicSelector } from '../TopicSelector/TopicSelector';
import { VelocitySliders } from '../VelocitySliders/VelocitySliders';

import type { ControlWidgetProps } from './ControlWidget.types';

import { TopicPublisher } from '@/services/ros/publisher/TopicPublisher';
import { rosServiceRegistry } from '@/services/ros/registry/RosServiceRegistry';
import { Show } from '@/shared/components/Show';
import { useRosStore } from '@/shared/stores/ros/ros.store';

export function ControlWidget({ robotId = '' }: ControlWidgetProps) {
  const connectionState = useRosStore(
    (state) => state.connectionStates[robotId]?.state ?? 'disconnected'
  );

  const noRobot = !robotId;
  const isDisabled = noRobot;

  // Stable store per widget instance (not per robotId — widget reconfiguration
  // handled by key at the parent level)
  const controlStore = useMemo(() => createControlStore(robotId), [robotId]);

  // Create publisher — uses rosServiceRegistry to get the transport for this robot
  const publisherRef = useRef<TopicPublisher | null>(null);
  if (!publisherRef.current && !noRobot) {
    const transport = rosServiceRegistry.get(robotId);
    const ros = transport.getRos();
    publisherRef.current = new TopicPublisher({
      ros,
      topicFactory: (opts) =>
        new ROSLIB.Topic({
          ros: ros as unknown as InstanceType<typeof ROSLIB.Ros>,
          name: opts.name,
          messageType: opts.messageType,
        }),
    });
  }

  // Available topics — full topic discovery is in Phase 4 hooks.
  // Must be a stable reference: an inline [] would cause useSyncExternalStore
  // to detect a changed snapshot every render and infinite-loop.
  const availableTopics = useMemo(
    () => [] as { name: string; type: string }[],
    []
  );

  // Wire publisher to store (only when we have a real robotId + publisher)
  const dummyPublisher = useMemo(
    () =>
      new TopicPublisher({
        ros: {
          isConnected: false,
          connect: () => undefined,
          close: () => undefined,
          on: () => undefined,
          off: () => undefined,
          removeAllListeners: () => undefined,
          getTopics: () => undefined,
        },
        topicFactory: () => ({
          name: '',
          messageType: '',
          advertise: () => undefined,
          unadvertise: () => undefined,
          publish: () => undefined,
          subscribe: () => undefined,
          unsubscribe: () => undefined,
        }),
      }),
    []
  );

  useControlPublisher({
    robotId,
    controlStore,
    publisher: noRobot
      ? dummyPublisher
      : (publisherRef.current ?? dummyPublisher),
  });

  function handleEStopActivate() {
    // Publish zero velocity immediately on activation
    if (publisherRef.current) {
      const handle = publisherRef.current.createTopicPublisher({
        topicName: controlStore.getState().selectedTopic,
        messageType: 'geometry_msgs/Twist',
      });
      handle.publish(zeroTwist());
      handle.dispose();
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded bg-slate-900 text-slate-200">
      <div className="flex h-full items-center gap-4 px-4 py-2">
        {/* E-Stop — LEFT side (ISO 13850). Always above overlay — never blocked. */}
        <div className="relative z-20 shrink-0">
          <EStop controlStore={controlStore} onActivate={handleEStopActivate} />
        </div>

        {/* Vertical divider */}
        <div className="h-full w-px bg-slate-700" />

        {/* Topic selector + D-pad center — disabled overlay covers only this region */}
        <div className="relative flex flex-1 flex-col items-center gap-3">
          <Show when={isDisabled}>
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-slate-900/80">
              <p className="text-sm text-slate-400">
                Connect a robot to enable controls
              </p>
            </div>
          </Show>
          <TopicSelector
            controlStore={controlStore}
            availableTopics={availableTopics}
          />
          <ControlPad controlStore={controlStore} disabled={isDisabled} />
        </div>

        {/* Vertical divider */}
        <div className="h-full w-px bg-slate-700" />

        {/* Velocity sliders */}
        <div className="relative w-48 shrink-0">
          <Show when={isDisabled}>
            <div className="absolute inset-0 z-10 rounded bg-slate-900/80" />
          </Show>
          <VelocitySliders controlStore={controlStore} />
        </div>
      </div>

      <Show when={connectionState !== 'connected' && !noRobot}>
        <div className="border-t border-slate-700 bg-slate-950 px-3 py-1 text-center text-xs text-amber-400">
          Robot {connectionState} — controls may not respond
        </div>
      </Show>
    </div>
  );
}
