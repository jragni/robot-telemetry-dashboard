import { BarChart3, Hash } from 'lucide-react';
import { useState } from 'react';

import { usePanelConfig, NoConnectionOverlay } from '../../shared';
import { useImuData } from '../hooks/useImuData';
import { useImuHistory } from '../hooks/useImuHistory';
import { type ImuViewMode, IMU_DEFAULT_TOPIC } from '../imu.types';

import { ImuDigitalView } from './ImuDigitalView';
import { ImuPlotView } from './ImuPlotView';

import type { PanelComponentProps } from '@/features/panels/panel.types';

// ---------------------------------------------------------------------------
// Panel config shape
// ---------------------------------------------------------------------------

interface ImuPanelConfig {
  topicName?: string;
}

// ---------------------------------------------------------------------------
// View toggle button
// ---------------------------------------------------------------------------

interface ViewToggleProps {
  viewMode: ImuViewMode;
  onToggle: () => void;
}

function ViewToggle({ viewMode, onToggle }: ViewToggleProps) {
  const isDigital = viewMode === 'digital';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDigital ? 'Switch to plot view' : 'Switch to digital view'}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {isDigital ? (
        <>
          <BarChart3 className="h-3 w-3" aria-hidden="true" />
          Plot
        </>
      ) : (
        <>
          <Hash className="h-3 w-3" aria-hidden="true" />
          Digital
        </>
      )}
    </button>
  );
}

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
