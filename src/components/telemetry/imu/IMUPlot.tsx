import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

import type { DataPoint, IMUPlotProps } from './definitions';

function IMUPlot({ data, metric }: IMUPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dataHistory, setDataHistory] = useState<DataPoint[]>([]);
  const maxDataPoints = 100; // Keep last 100 data points
  const timeWindow = 10000; // 10 seconds

  // Simulate streaming data for development
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const metricData = data[metric];

      // Add some random variation to simulate streaming data
      const variation = () => (Math.random() - 0.5) * 0.1;

      const newPoint: DataPoint = {
        timestamp: now,
        x: metricData.x + variation(),
        y: metricData.y + variation(),
        z: metricData.z + variation(),
      };

      setDataHistory((prev) => {
        const updated = [...prev, newPoint];
        // Keep only points within time window
        const cutoff = now - timeWindow;
        const filtered = updated.filter((d) => d.timestamp >= cutoff);
        // Limit to max data points
        return filtered.slice(-maxDataPoints);
      });
    }, 100); // Update every 100ms

    return () => clearInterval(interval);
  }, [data, metric]);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || dataHistory.length < 2) {
      return;
    }

    const svg = d3.select(svgRef.current);
    const container = svgRef.current.parentElement;
    if (!container) {
      return;
    }

    const margin = { top: 20, right: 60, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    // Clear previous content
    svg.selectAll('*').remove();

    // Create main group
    const g = svg
      .attr('width', container.clientWidth)
      .attr('height', container.clientHeight)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xExtent = d3.extent(dataHistory, (d) => d.timestamp) as [
      number,
      number,
    ];
    const xScale = d3.scaleLinear().domain(xExtent).range([0, width]);

    const allValues = dataHistory.flatMap((d) => [d.x, d.y, d.z]);
    const yExtent = d3.extent(allValues) as [number, number];
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1 || 1;
    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([height, 0]);

    // Grid lines
    const makeXGridlines = () => d3.axisBottom(xScale).ticks(5);
    const makeYGridlines = () => d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.2)
      .call(
        makeXGridlines()
          .tickSize(-height)
          .tickFormat(() => '')
      );

    g.append('g')
      .attr('class', 'grid')
      .style('stroke-dasharray', '2,2')
      .style('opacity', 0.2)
      .call(
        makeYGridlines()
          .tickSize(-width)
          .tickFormat(() => '')
      );

    // Axes
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat((d) => {
        const seconds = Math.floor((Date.now() - (d as number)) / 1000);
        return `-${seconds}s`;
      });

    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .call(xAxis);

    g.append('g')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .call(yAxis);

    // Line generators
    const lineX = d3
      .line<DataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.x))
      .curve(d3.curveMonotoneX);

    const lineY = d3
      .line<DataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.y))
      .curve(d3.curveMonotoneX);

    const lineZ = d3
      .line<DataPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yScale(d.z))
      .curve(d3.curveMonotoneX);

    // Draw lines
    g.append('path')
      .datum(dataHistory)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444') // red for X
      .attr('stroke-width', 1.5)
      .attr('d', lineX);

    g.append('path')
      .datum(dataHistory)
      .attr('fill', 'none')
      .attr('stroke', '#22c55e') // green for Y
      .attr('stroke-width', 1.5)
      .attr('d', lineY);

    g.append('path')
      .datum(dataHistory)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6') // blue for Z
      .attr('stroke-width', 1.5)
      .attr('d', lineZ);

    // Legend
    const legend = g
      .append('g')
      .attr('transform', `translate(${width + 10}, 0)`);

    const legendData = [
      { label: 'X', color: '#ef4444' },
      { label: 'Y', color: '#22c55e' },
      { label: 'Z', color: '#3b82f6' },
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend
        .append('g')
        .attr('transform', `translate(0, ${i * 20})`);

      legendRow
        .append('line')
        .attr('x1', 0)
        .attr('x2', 15)
        .attr('y1', 5)
        .attr('y2', 5)
        .attr('stroke', item.color)
        .attr('stroke-width', 2);

      legendRow
        .append('text')
        .attr('x', 20)
        .attr('y', 9)
        .style('font-size', '10px')
        .style('font-family', 'monospace')
        .text(item.label);
    });
  }, [dataHistory]);

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}

export default IMUPlot;
