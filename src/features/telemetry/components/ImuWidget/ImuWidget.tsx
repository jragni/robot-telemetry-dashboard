import { useState } from 'react';

import { useImuData } from '../../hooks/useImuData';
import { useRosConnection } from '../../hooks/useRosConnection';
import { NoConnectionOverlay } from '../NoConnectionOverlay/NoConnectionOverlay';

import type { ImuWidgetProps, ViewMode } from './ImuWidget.types';

import { Show } from '@/shared/components/Show';

function formatDeg(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  return val.toFixed(2);
}

function formatVec(
  vec: { x: number; y: number; z: number } | null | undefined
): string {
  if (!vec) return '—';
  return `x: ${vec.x.toFixed(3)}  y: ${vec.y.toFixed(3)}  z: ${vec.z.toFixed(3)}`;
}

export function ImuWidget({
  robotId,
  topicName,
  throttleMs = 100,
}: ImuWidgetProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('digital');
  const { isConnected, connectionState } = useRosConnection(robotId);
  const { imuData, euler, history } = useImuData(
    robotId,
    topicName,
    throttleMs
  );

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded bg-slate-900 text-slate-200">
      <Show when={!isConnected}>
        <NoConnectionOverlay
          robotId={robotId}
          connectionState={connectionState}
        />
      </Show>

      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-slate-700 px-3 py-2">
        <button
          onClick={() => setViewMode('digital')}
          aria-pressed={viewMode === 'digital'}
          className="rounded px-2 py-1 text-xs font-medium data-[active=true]:bg-slate-700"
          data-active={viewMode === 'digital'}
        >
          Digital
        </button>
        <button
          onClick={() => setViewMode('plot')}
          aria-pressed={viewMode === 'plot'}
          className="rounded px-2 py-1 text-xs font-medium data-[active=true]:bg-slate-700"
          data-active={viewMode === 'plot'}
        >
          Plot
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        <Show when={viewMode === 'digital'}>
          <Show
            when={!!imuData || !!euler}
            fallback={
              <div data-testid="imu-skeleton" className="space-y-2">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-700" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-700" />
                <div className="h-4 w-28 animate-pulse rounded bg-slate-700" />
              </div>
            }
          >
            <div className="space-y-3 text-sm">
              {/* Euler angles */}
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Orientation (Euler)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-xs text-slate-400">Roll</span>
                    <div className="font-mono">{formatDeg(euler?.roll)}°</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Pitch</span>
                    <div className="font-mono">{formatDeg(euler?.pitch)}°</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Yaw</span>
                    <div className="font-mono">{formatDeg(euler?.yaw)}°</div>
                  </div>
                </div>
              </section>

              {/* Angular velocity */}
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Angular Velocity
                </h3>
                <div className="font-mono text-xs">
                  {formatVec(imuData?.angular_velocity)}
                </div>
              </section>

              {/* Linear acceleration */}
              <section>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Linear Acceleration
                </h3>
                <div className="font-mono text-xs">
                  {formatVec(imuData?.linear_acceleration)}
                </div>
              </section>
            </div>
          </Show>
        </Show>

        <Show when={viewMode === 'plot'}>
          <div data-testid="imu-plot-view" className="h-full">
            <Show
              when={history.length > 0}
              fallback={
                <span className="text-xs text-slate-500">
                  Waiting for data…
                </span>
              }
            >
              <div className="space-y-1 text-xs">
                {history.slice(-5).map((pt, i) => (
                  <div key={i} className="font-mono text-slate-400">
                    t={pt.timestamp} r={pt.roll.toFixed(1)} p=
                    {pt.pitch.toFixed(1)} y={pt.yaw.toFixed(1)}
                  </div>
                ))}
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}
