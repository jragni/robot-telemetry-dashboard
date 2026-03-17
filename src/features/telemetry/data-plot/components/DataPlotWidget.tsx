import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

import type { PlotSample } from '../data-plot.types';
import { useDataPlot } from '../hooks/useDataPlot';

import { LINE_COLOURS, MARGIN } from './DataPlotWidget.constants';
import { TopicSelector } from './TopicSelector';

import { NoConnectionOverlay } from '@/components/shared/NoConnectionOverlay';
import { Show } from '@/components/shared/Show';
import { useElementSize } from '@/hooks/useElementSize';
import type { PanelComponentProps } from '@/types/panel.types';

function drawChart(
  svg: SVGSVGElement,
  samples: PlotSample[],
  width: number,
  height: number
) {
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  if (innerW <= 0 || innerH <= 0 || samples.length === 0) {
    d3.select(svg).selectAll('*').remove();
    return;
  }

  const keys = Object.keys(samples[0].values);

  const xExtent = d3.extent(samples, (d) => d.timestamp) as [number, number];
  const xScale = d3.scaleTime().domain(xExtent).range([0, innerW]);

  const allValues = samples.flatMap((s) => Object.values(s.values));
  const [yMin, yMax] = d3.extent(allValues) as [number, number];
  const yPad = (yMax - yMin) * 0.1 || 1;
  const yScale = d3
    .scaleLinear()
    .domain([yMin - yPad, yMax + yPad])
    .range([innerH, 0])
    .nice();

  const root = d3.select(svg);
  root.selectAll('*').remove();
  root.attr('width', width).attr('height', height);

  const g = root
    .append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  // Axes
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(
      d3
        .axisBottom(xScale)
        .ticks(4)
        .tickFormat((d) => {
          const date = d instanceof Date ? d : new Date(d as number);
          return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
        })
    )
    .call((axis) =>
      axis
        .selectAll('text')
        .style('font-size', '9px')
        .style('fill', 'hsl(var(--muted-foreground))')
    )
    .call((axis) =>
      axis.selectAll('line, path').style('stroke', 'hsl(var(--border))')
    );

  g.append('g')
    .call(d3.axisLeft(yScale).ticks(4))
    .call((axis) =>
      axis
        .selectAll('text')
        .style('font-size', '9px')
        .style('fill', 'hsl(var(--muted-foreground))')
    )
    .call((axis) =>
      axis.selectAll('line, path').style('stroke', 'hsl(var(--border))')
    );

  // Lines
  keys.forEach((key, i) => {
    const line = d3
      .line<PlotSample>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.values[key] ?? 0))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(samples)
      .attr('fill', 'none')
      .attr('stroke', LINE_COLOURS[i % LINE_COLOURS.length])
      .attr('stroke-width', 1.5)
      .attr('d', line);
  });
}

// ---------------------------------------------------------------------------
// DataPlotWidget
// ---------------------------------------------------------------------------

export function DataPlotWidget({ robotId, panelId }: PanelComponentProps) {
  const {
    samples,
    strategy,
    selectedTopic,
    connectionState,
    setSelectedTopic,
    clearSamples,
  } = useDataPlot(robotId);

  const svgRef = useRef<SVGSVGElement>(null);
  const [containerRef, containerSize] = useElementSize<HTMLDivElement>();

  // Track legend keys for currently rendered strategy
  const [legendKeys, setLegendKeys] = useState<string[]>([]);

  useEffect(() => {
    if (samples.length > 0 && samples[0]) {
      setLegendKeys(Object.keys(samples[0].values));
    }
  }, [samples]);

  // Redraw on new samples or container resize
  useEffect(() => {
    if (
      !svgRef.current ||
      containerSize.width === 0 ||
      containerSize.height === 0
    )
      return;
    drawChart(
      svgRef.current,
      samples,
      containerSize.width,
      containerSize.height - 40
    );
  }, [samples, containerSize]);

  return (
    <div
      ref={containerRef}
      data-panel-id={panelId}
      className="relative flex h-full w-full flex-col overflow-hidden"
    >
      <NoConnectionOverlay connectionState={connectionState} />

      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/50 p-2">
        <TopicSelector
          robotId={robotId}
          selected={selectedTopic}
          onSelect={setSelectedTopic}
        />

        <Show when={selectedTopic !== null}>
          <span className="font-mono text-xs text-muted-foreground">
            {strategy.label}
          </span>
        </Show>

        <button
          type="button"
          onClick={clearSamples}
          aria-label="Clear plot"
          className="ml-auto rounded bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
        >
          Clear
        </button>
      </div>

      {/* Legend */}
      <Show when={legendKeys.length > 0}>
        <div className="flex shrink-0 flex-wrap gap-2 px-3 py-1">
          {legendKeys.map((key, i) => (
            <span
              key={key}
              className="flex items-center gap-1 font-mono text-xs"
            >
              <span
                aria-hidden="true"
                className="inline-block h-2 w-4 rounded-sm"
                style={{
                  backgroundColor: LINE_COLOURS[i % LINE_COLOURS.length],
                }}
              />
              {key}
            </span>
          ))}
        </div>
      </Show>

      {/* Chart area */}
      <div className="relative flex-1 overflow-hidden">
        <Show when={!selectedTopic && connectionState === 'connected'}>
          <p className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground">
            Select a topic to start plotting.
          </p>
        </Show>

        <Show when={selectedTopic !== null && samples.length === 0}>
          <p className="absolute inset-0 flex items-center justify-center font-mono text-xs text-muted-foreground">
            Waiting for data…
          </p>
        </Show>

        <svg
          ref={svgRef}
          aria-label={`Data plot for ${selectedTopic?.name ?? 'no topic'}`}
          className="block h-full w-full"
        />
      </div>
    </div>
  );
}
