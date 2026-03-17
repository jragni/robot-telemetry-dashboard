import { useState } from 'react';

import { usePanelConfig } from '../../shared/usePanelConfig';
import { useImuData } from '../hooks/useImuData';
import { useImuHistory } from '../hooks/useImuHistory';
import { type ImuViewMode, IMU_DEFAULT_TOPIC } from '../imu.types';

import { ImuDigitalView } from './ImuDigitalView';
import { ImuPlotView } from './ImuPlotView';
import type { ImuPanelConfig } from './ImuWidget.types';
import { ViewToggle } from './ViewToggle';

import { NoConnectionOverlay } from '@/components/shared/NoConnectionOverlay';
import type { PanelComponentProps } from '@/types/panel.types';

// ---------------------------------------------------------------------------
// ImuWidget
// ---------------------------------------------------------------------------

/**
 * Top-level IMU panel widget. Reads topic configuration from the layout store,
 * subscribes to the IMU topic, and delegates rendering to either the digital
 * read-out or the D3 time-series plot based on the active view mode.
 *
 * When the robot is not connected a full-panel overlay is shown instead.
 */
export function ImuWidget({ robotId, panelId }: PanelComponentProps) {
  const config = usePanelConfig(panelId) as ImuPanelConfig | undefined;
  const topicName = config?.topicName ?? IMU_DEFAULT_TOPIC;

  const [viewMode, setViewMode] = useState<ImuViewMode>('digital');

  const toggleView = () =>
    setViewMode((prev) => (prev === 'digital' ? 'plot' : 'digital'));

  // Always call both hooks — history wraps data internally so only one ROS
  // subscription is created per panel instance.
  const { data, connectionState } = useImuData(robotId, topicName);
  const { history } = useImuHistory(robotId, topicName);

  const isConnected = connectionState === 'connected';

  return (
    <div className="relative flex flex-col w-full h-full overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border shrink-0">
        <span className="text-xs font-mono text-muted-foreground truncate max-w-[60%]">
          {topicName}
        </span>
        <ViewToggle viewMode={viewMode} onToggle={toggleView} />
      </div>

      {/* Content */}
      <div className="relative flex-1 min-h-0">
        {!isConnected && (
          <NoConnectionOverlay connectionState={connectionState} />
        )}

        {viewMode === 'digital' ? (
          data !== null ? (
            <ImuDigitalView data={data} />
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              Waiting for data...
            </div>
          )
        ) : (
          <ImuPlotView history={history} />
        )}
      </div>
    </div>
  );
}
