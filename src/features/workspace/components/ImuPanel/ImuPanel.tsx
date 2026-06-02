import { useState } from 'react';

import { useImuSubscription } from '@/hooks';
import { cn } from '@/lib/utils';
import type { ImuPanelProps, ImuVariant } from '@/features/workspace/types/ImuPanel.types';

import { ImuVizSelect } from './components/ImuVizSelect';
import { OrientationUnknown } from './components/OrientationUnknown';
import { VARIANT_VIEWS } from './constants';

/** ImuPanel
 * @description Renders the IMU attitude display in one of four visualization
 *  modes. Owns its ROS subscription via useImuSubscription, manages variant
 *  state, and renders the mode selector internally.
 *  Always visible — disconnected state renders at muted opacity.
 * @prop ros - Active roslib connection, or undefined when disconnected.
 * @prop connected - Whether the robot is currently connected.
 * @prop topicName - The IMU topic name to subscribe to.
 */
export function ImuPanel({ connected, ros, topicName }: ImuPanelProps) {
  const { orientation } = useImuSubscription(ros, topicName);
  const [variant, setVariant] = useState<ImuVariant>('attitude-compass');
  const ViewToRender = VARIANT_VIEWS[variant];

  const orientationView = orientation ? (
    <ViewToRender pitch={orientation.pitch} roll={orientation.roll} yaw={orientation.yaw} />
  ) : (
    <OrientationUnknown />
  );

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 w-full h-full min-h-0',
        !connected && 'opacity-50',
      )}
    >
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        {orientationView}
      </div>
      <ImuVizSelect onChange={setVariant} value={variant} />
    </div>
  );
}
