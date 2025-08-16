'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

import { useConnection } from '@/components/dashboard/ConnectionProvider';

import { LaserScanMessage, ScanPoint } from './definitions';

export default function LaserScanVisualization(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const svgRef = useRef<SVGSVGElement>(null);
  const [scanData, setScanData] = useState<ScanPoint[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // NOTE arbitrarily set for best visualization of objects within close proximity
  const maxRange = 5;

  const processLaserScan = useCallback((message: LaserScanMessage) => {
    const points: ScanPoint[] = [];

    message.ranges.forEach((range, index) => {
      if (
        range >= message.range_min && 
        range <= message.range_max && 
        !isNaN(range) && 
        isFinite(range)
      ) {
        const angle = message.angle_min + index * message.angle_increment;

        // NOTE: To ensure up is always "up" shift the x and y by 90 degrees
        const x = range * Math.cos(angle + Math.PI / 2);
        const y = range * Math.sin(angle + Math.PI / 2);

        points.push({
          x,
          y,
          range,
          angle,
        });
      }
    });

    setScanData(points);
  }, []);

  useEffect(() => {
    let scanTopic: ROSLIB.Topic | null = null;

    const setupSubscription = async () => {
      if (!selectedConnection?.rosInstance || selectedConnection.status !== 'connected') {
        setIsSubscribed(false);
        setScanData([]);
        return;
      }

      const ROSLIB = await import('roslib');

      scanTopic = new ROSLIB.default.Topic({
        ros: selectedConnection.rosInstance,
        name: '/scan',
        messageType: 'sensor_msgs/LaserScan',
      });

      scanTopic.subscribe((message: LaserScanMessage) => {
        processLaserScan(message);
      });

      setIsSubscribed(true);
    };

    setupSubscription();

    return () => {
      if (scanTopic) {
        scanTopic.unsubscribe();
        setIsSubscribed(false);
      }
    };
  }, [selectedConnection, processLaserScan]);

  useEffect(() => {
    if (!svgRef.current || scanData.length === 0) return;

    const svg = d3.select(svgRef.current);

    // Static sizing to prevent growth animation
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = 600; // Fixed width
    const height = 400; // Fixed height

    svg.selectAll('*').remove();


    const xScale = d3.scaleLinear()
      .domain([-maxRange, maxRange])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-maxRange, maxRange])
      .range([height, 0]);

    // Set fixed dimensions immediately to prevent growth
    svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add grid lines
    const gridLines = g.append('g').attr('class', 'grid');
    // Vertical grid lines
    gridLines.selectAll('.grid-line-vertical')
      .data(xScale.ticks(10))
      .enter()
      .append('line')
      .attr('class', 'grid-line-vertical')
      .attr('x1', d => xScale(d))
      .attr('y1', 0)
      .attr('x2', d => xScale(d))
      .attr('y2', height)
      .style('stroke', '#e5e7eb')
      .style('stroke-width', 0.5)
      .style('opacity', 0.5);

    // Horizontal grid lines
    gridLines.selectAll('.grid-line-horizontal')
      .data(yScale.ticks(8))
      .enter()
      .append('line')
      .attr('class', 'grid-line-horizontal')
      .attr('x1', 0)
      .attr('y1', d => yScale(d))
      .attr('x2', width)
      .attr('y2', d => yScale(d))
      .style('stroke', '#e5e7eb')
      .style('stroke-width', 0.5)
      .style('opacity', 0.5);

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .style('color', '#6b7280');

    g.append('g')
      .attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(8))
      .style('color', '#6b7280');

    // Add robot position (origin)
    g.append('circle')
      .attr('cx', xScale(0))
      .attr('cy', yScale(0))
      .attr('r', 4)
      .style('fill', '#ef4444')
      .style('stroke', '#dc2626')
      .style('stroke-width', 2);

    // Add scan points
    g.selectAll('.scan-point')
      .data(scanData)
      .enter()
      .append('circle')
      .attr('class', 'scan-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 1.5)
      .style('fill', '#3b82f6')
      .style('fill-opacity', 0.7);

    // Add labels
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Distance (m)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 10)
      .attr('x', 0 - (height / 2))
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6b7280')
      .text('Distance (m)');

  }, [maxRange, scanData]);

  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No connection available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <h3 className="text-lg font-semibold">Laser Scan Visualization</h3>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
            <span className="hidden sm:inline">Robot</span>
            <span className="sm:hidden">R</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
            <span className="hidden sm:inline">Scan Points ({scanData.length})</span>
            <span className="sm:hidden">Points: {scanData.length}</span>
          </div>
          <div className={`px-2 py-1 rounded text-xs ${
            isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isSubscribed ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>
      {/* PLOT */}
      <div className="border rounded-lg bg-white p-2 sm:p-4 overflow-hidden">
        <div className="flex justify-center">
          <svg className="max-w-full h-auto" ref={svgRef}></svg>
        </div>
      </div>
      {scanData.length === 0 && isSubscribed && (
        <div className="text-center text-gray-500 mt-4">
          <p>Waiting for scan data on /scan topic...</p>
        </div>
      )}
    </div>
  );
}