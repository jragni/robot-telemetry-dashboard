import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ImuVariant, ImuPanelProps } from '@/features/workspace/types/ImuPanel.types';
import { VARIANT_VIEWS } from './constants';
import { ImuVizSelect } from './components/ImuVizSelect';

/** ImuPanel
 * @description Renders the IMU attitude display in one of four visualization
 *  modes. Owns its variant state and renders the mode selector internally.
 *  Always visible — disconnected state renders at muted opacity.
 * @param roll - Roll angle in degrees.
 * @param pitch - Pitch angle in degrees.
 * @param yaw - Yaw heading in degrees.
 * @param connected - Whether the robot is currently connected.
 */
export function ImuPanel({ roll, pitch, yaw, connected }: ImuPanelProps) {
  const [variant, setVariant] = useState<ImuVariant>('attitude-compass');
  const ViewToRender = VARIANT_VIEWS[variant];

  return (
    <div className={cn('flex flex-col items-center gap-3 w-full', !connected && 'opacity-50')}>
      <ViewToRender roll={roll} pitch={pitch} yaw={yaw} />
      <ImuVizSelect value={variant} onChange={setVariant} />
    </div>
  );
}
