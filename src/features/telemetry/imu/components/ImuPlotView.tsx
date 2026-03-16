import * as d3 from 'd3';
import { useRef, useEffect } from 'react';

import type { ImuDerivedData } from '../imu.types';

import { useElementSize } from '@/hooks/useElementSize';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ImuPlotViewProps {
  history: ImuDerivedData[];
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const MARGIN = { top: 8, right: 12, bottom: 24, left: 36 };
const LINE_COLORS = {
  x: '#f87171', // red-400
  y: '#4ade80', // green-400
  z: '#60a5fa', // blue-400
} as const;

// ---------------------------------------------------------------------------
// D3 rendering helper
// ---------------------------------------------------------------------------

function renderPlot(
  svg: SVGSVGElement,
  history: ImuDerivedData[],
  width: number,
  height: number
) {
  const innerW = width - MARGIN.left - MARGIN.right;
  const innerH = height - MARGIN.top - MARGIN.bottom;

  if (innerW <= 0 || innerH <= 0) return;

  const sel = d3.select(svg);
  sel.selectAll('*').remove();

  const g = sel
    .append('g')
    .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

  if (history.length === 0) {
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '12px')
      .text('Waiting for data...');
    return;
  }

  const timestamps = history.map((d) => d.timestamp);
  const tMin = timestamps[0];
  const tMax = timestamps[timestamps.length - 1];

  const xScale = d3.scaleLinear().domain([tMin, tMax]).range([0, innerW]);

  const allValues = history.flatMap((d) => [d.accelX, d.accelY, d.accelZ]);
  const [vMin, vMax] = d3.extent(allValues) as [number, number];
  const padding = Math.max(0.5, (vMax - vMin) * 0.1);

  const yScale = d3
    .scaleLinear()
    .domain([vMin - padding, vMax + padding])
    .range([innerH, 0])
    .nice();

  // Axes
  const xAxis = d3
    .axisBottom<number>(xScale)
    .ticks(4)
    .tickFormat(() => '');

  const yAxis = d3.axisLeft<number>(yScale).ticks(4).tickSizeInner(-innerW);

  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .attr('class', 'x-axis')
    .call(xAxis)
    .select('.domain')
    .attr('stroke', '#374151');

  const yG = g.append('g').attr('class', 'y-axis').call(yAxis);

  yG.select('.domain').attr('stroke', '#374151');
  yG.selectAll('.tick line')
    .attr('stroke', '#1f2937')
    .attr('stroke-dasharray', '2,2');
  yG.selectAll('.tick text').attr('fill', '#9ca3af').attr('font-size', '10px');

  // Line generator
  function makeLine(
    accessor: (d: ImuDerivedData) => number
  ): d3.Line<ImuDerivedData> {
    return d3
      .line<ImuDerivedData>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(accessor(d)))
      .defined((d) => isFinite(accessor(d)));
  }

  const axes: {
    key: keyof typeof LINE_COLORS;
    accessor: (d: ImuDerivedData) => number;
  }[] = [
    { key: 'x', accessor: (d) => d.accelX },
    { key: 'y', accessor: (d) => d.accelY },
    { key: 'z', accessor: (d) => d.accelZ },
  ];

  for (const { key, accessor } of axes) {
    g.append('path')
      .datum(history)
      .attr('fill', 'none')
      .attr('stroke', LINE_COLORS[key])
      .attr('stroke-width', 1.5)
      .attr('d', makeLine(accessor));
  }

  // Y-axis label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerH / 2)
    .attr('y', -MARGIN.left + 10)
    .attr('text-anchor', 'middle')
    .attr('fill', '#6b7280')
    .attr('font-size', '10px')
    .text('m/s²');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a scrolling D3 time-series chart of linear acceleration (X, Y, Z)
 * from the IMU history buffer. Lines are colour-coded: X=red, Y=green, Z=blue.
 */
export function ImuPlotView({ history }: ImuPlotViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerRef, { width, height }] = useElementSize<HTMLDivElement>();

  useEffect(() => {
    if (!svgRef.current || width === 0 || height === 0) return;
    renderPlot(svgRef.current, history, width, height);
  }, [history, width, height]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-0">
      {/* Legend */}
      <div className="absolute top-1 right-2 flex items-center gap-3 z-10 pointer-events-none">
        {(
          [
            { color: LINE_COLORS.x, label: 'X' },
            { color: LINE_COLORS.y, label: 'Y' },
            { color: LINE_COLORS.z, label: 'Z' },
          ] as const
        ).map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className="inline-block w-3 h-0.5 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs font-mono text-muted-foreground">
              {label}
            </span>
          </span>
        ))}
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        aria-label="IMU acceleration time series"
        role="img"
      />
    </div>
  );
}
