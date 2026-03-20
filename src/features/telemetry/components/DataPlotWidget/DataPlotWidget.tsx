import { useDataPlot } from '../../hooks/useDataPlot';
import { useRosConnection } from '../../hooks/useRosConnection';
import { NoConnectionOverlay } from '../NoConnectionOverlay/NoConnectionOverlay';

import type { DataPlotWidgetProps } from './DataPlotWidget.types';

import { Show } from '@/shared/components/Show';

const SERIES_WARN_THRESHOLD = 5;

const FIELD_COLORS = [
  '#00e5ff',
  '#69ff47',
  '#ff6b35',
  '#ff3cac',
  '#a855f7',
  '#fbbf24',
];

export function DataPlotWidget({
  robotId,
  topicName,
  selectedFields = [],
  windowSecs = 30,
  throttleMs = 100,
}: DataPlotWidgetProps) {
  const { isConnected, connectionState } = useRosConnection(robotId);
  const { availableFields, timestamps, series } = useDataPlot(
    robotId,
    topicName,
    selectedFields,
    windowSecs,
    throttleMs
  );

  const hasAvailableFields = availableFields.length > 0;
  const hasSelectedFields = selectedFields.length > 0;
  const hasSeriesData = hasSelectedFields && timestamps.length > 0;
  const showPerfWarning = selectedFields.length > SERIES_WARN_THRESHOLD;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded bg-slate-900 text-slate-200">
      <Show when={!isConnected}>
        <NoConnectionOverlay
          robotId={robotId}
          connectionState={connectionState}
        />
      </Show>

      {/* Performance warning */}
      <Show when={showPerfWarning}>
        <div className="shrink-0 bg-amber-900/40 px-3 py-1 text-xs text-amber-300">
          High series count — may impact performance
        </div>
      </Show>

      {/* Field picker */}
      <div className="shrink-0 border-b border-slate-700 px-3 py-2">
        <Show
          when={hasAvailableFields}
          fallback={
            <span className="text-xs text-slate-500">
              Waiting for topic messages…
            </span>
          }
        >
          <div className="flex flex-wrap gap-2">
            {availableFields.map((field, i) => {
              const checked = selectedFields.includes(field);
              const color = FIELD_COLORS[i % FIELD_COLORS.length];
              return (
                <label
                  key={field}
                  className="flex cursor-pointer items-center gap-1 text-xs"
                >
                  <input
                    type="checkbox"
                    name={field}
                    aria-label={field}
                    checked={checked}
                    onChange={() => {
                      // DataPlotWidget is controlled — parent owns selectedFields
                      // In tests this is read-only; no callback prop yet
                    }}
                    readOnly
                    style={{ accentColor: color }}
                  />
                  <span style={{ color }}>{field}</span>
                </label>
              );
            })}
          </div>
        </Show>
      </div>

      {/* Chart area */}
      <div className="flex-1 overflow-hidden p-2">
        <Show when={hasAvailableFields && !hasSelectedFields} fallback={null}>
          <div
            data-testid="data-plot-chart"
            className="flex h-full items-center justify-center text-xs text-slate-500"
          >
            Select fields above to begin plotting
          </div>
        </Show>

        <Show when={!hasAvailableFields}>
          <div
            data-testid="data-plot-chart"
            className="flex h-full items-center justify-center text-xs text-slate-500"
          >
            No numeric fields detected in topic messages
          </div>
        </Show>

        <Show when={hasAvailableFields && hasSelectedFields}>
          <div data-testid="data-plot-chart" className="h-full">
            <Show
              when={hasSeriesData}
              fallback={
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  Select fields above to begin plotting
                </div>
              }
            >
              {/* Simple SVG sparkline chart */}
              <svg
                className="h-full w-full"
                viewBox="0 0 400 200"
                preserveAspectRatio="none"
              >
                {selectedFields.map((field, fi) => {
                  const values = series[field];
                  if (!values || values.length < 2) return null;

                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  const range = max - min || 1;
                  const color = FIELD_COLORS[fi % FIELD_COLORS.length];

                  const points = values
                    .map((v, i) => {
                      const x = (i / (values.length - 1)) * 400;
                      const y = 200 - ((v - min) / range) * 180 - 10;
                      return `${x},${y}`;
                    })
                    .join(' ');

                  return (
                    <polyline
                      key={field}
                      points={points}
                      fill="none"
                      stroke={color}
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}
