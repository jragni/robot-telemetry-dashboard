'use client';

import { useEffect, useRef, useState, useCallback, memo } from 'react';
import * as d3 from 'd3';

import { useConnection } from '@/components/dashboard/ConnectionProvider';
import { usePilotMode } from '@/components/pilot/usePilotMode';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { LaserScanMessage, ScanPoint } from './definitions';

function LaserScanVisualization(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const { isPilotMode } = usePilotMode();
  const svgRef = useRef<SVGSVGElement>(null);
  const [scanData, setScanData] = useState<ScanPoint[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('/scan');
  const [laserScanTopics, setLaserScanTopics] = useState<string[]>(['/scan']);

  // NOTE arbitrarily set for best visualization of objects within close proximity
  const maxRange = 5;

  const processLaserScan = useCallback((message: LaserScanMessage) => {
    const points: ScanPoint[] = [];

    // Data decimation for performance - skip every other point for high-resolution scans
    const skipFactor = message.ranges.length > 720 ? 2 : 1; // Decimate if >720 points

    for (let index = 0; index < message.ranges.length; index += skipFactor) {
      const range = message.ranges[index];
      if (
        range >= message.range_min
        && range <= message.range_max
        && !isNaN(range)
        && isFinite(range)
        && range <= maxRange // Additional filter for visualization range
      ) {
        const angle = message.angle_min + (index * message.angle_increment);

        // NOTE: To ensure up is always "up" shift the x and y by 90 degrees
        const x = range * Math.cos(angle + (Math.PI / 2));
        const y = range * Math.sin(angle + (Math.PI / 2));

        points.push({
          x,
          y,
          range,
          angle,
        });
      }
    }

    setScanData(points);
  }, [maxRange]);

  // Fetch available LaserScan topics when connection changes
  useEffect(() => {
    if (!selectedConnection?.rosInstance) {
      setLaserScanTopics(['/scan']);
      return;
    }

    const { rosInstance } = selectedConnection;

    const fetchTopics = async () => {
      try {
        const ROSLIB = await import('roslib');

        const getTopics = new ROSLIB.default.Service({
          ros: rosInstance,
          name: '/rosapi/topics_for_type',
          serviceType: 'rosapi/TopicsForType',
        });

        const request = new ROSLIB.default.ServiceRequest({
          type: 'sensor_msgs/LaserScan',
        });

        getTopics.callService(request, (result: { topics?: string[] }) => {
          if (result?.topics && result.topics.length > 0) {
            setLaserScanTopics(result.topics);
            // If current selected topic is not in the list, reset to /scan or first available
            if (!result.topics.includes(selectedTopic)) {
              setSelectedTopic(result.topics.includes('/scan') ? '/scan' : result.topics[0]);
            }
          } else {
            // Fallback to default
            setLaserScanTopics(['/scan']);
            setSelectedTopic('/scan');
          }
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch LaserScan topics:', error);
        setLaserScanTopics(['/scan']);
        setSelectedTopic('/scan');
      }
    };

    fetchTopics();
  }, [selectedConnection, selectedTopic]);

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
        name: selectedTopic,
        messageType: 'sensor_msgs/LaserScan',
      });

      scanTopic.subscribe((message: any) => {
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
  }, [selectedConnection, selectedTopic, processLaserScan]);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const container = svgRef.current.parentElement;

    // Get container dimensions for responsive sizing
    const containerRect = container?.getBoundingClientRect();
    // Optimized margins for pilot mode - more compact, professional
    const margin = isPilotMode
      ? { top: 15, right: 15, bottom: 15, left: 15 }
      : { top: 20, right: 25, bottom: 35, left: 35 };

    // Make responsive dimensions that scale well
    const containerWidth = (containerRect?.width ?? 400);
    const containerHeight = (containerRect?.height ?? 400);
    const availableWidth = containerWidth - margin.left - margin.right;
    const availableHeight = containerHeight - margin.top - margin.bottom;

    // Ensure square aspect ratio but allow better scaling
    // Use 90% of the smaller dimension to give more space while maintaining square shape
    const maxSize = Math.min(availableWidth, availableHeight);
    // Flexible sizing for pilot mode - allow smaller displays
    const minSize = isPilotMode ? 80 : 120;
    const size = Math.max(maxSize * 0.95, minSize);
    const width = size;
    const height = size;

    // PERFORMANCE FIX: Only create SVG structure once, then just update data
    let g = svg.select<SVGGElement>('g.main-group');
    const xScale = d3.scaleLinear()
      .domain([-maxRange, maxRange])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-maxRange, maxRange])
      .range([height, 0]);

    if (g.empty()) {
      // First time setup - clear and create structure
      svg.selectAll('*').remove();

      // Set responsive dimensions to fill container
      svg
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      g = svg
        .append('g')
        .attr('class', 'main-group')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create all static elements only on first render
      // Professional grid system - adaptive density
      const gridLines = g.append('g').attr('class', 'grid');
      const gridDensity = isPilotMode ? 5 : 10; // Cleaner grid in pilot mode

      // Vertical grid lines - subtle, professional
      gridLines.selectAll('.grid-line-vertical')
        .data(xScale.ticks(gridDensity))
        .enter()
        .append('line')
        .attr('class', 'grid-line-vertical')
        .attr('x1', d => xScale(d))
        .attr('y1', 0)
        .attr('x2', d => xScale(d))
        .attr('y2', height)
        .style('stroke', isPilotMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)')
        .style('stroke-width', isPilotMode ? '0.25' : '0.5');

      // Horizontal grid lines
      gridLines.selectAll('.grid-line-horizontal')
        .data(yScale.ticks(gridDensity))
        .enter()
        .append('line')
        .attr('class', 'grid-line-horizontal')
        .attr('x1', 0)
        .attr('y1', d => yScale(d))
        .attr('x2', width)
        .attr('y2', d => yScale(d))
        .style('stroke', isPilotMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)')
        .style('stroke-width', isPilotMode ? '0.25' : '0.5');

      // Professional axes - clean and minimal
      const tickCount = isPilotMode ? 3 : 5;
      const fontSize = isPilotMode ? '8px' : '10px';
      const axisOpacity = isPilotMode ? 0.6 : 0.8;

      const xAxis = g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale).ticks(tickCount));

      xAxis.selectAll('text')
        .style('font-size', fontSize)
        .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
        .style('fill', `rgba(255, 255, 255, ${axisOpacity})`);

      xAxis.selectAll('.domain, .tick line')
        .style('stroke', `rgba(255, 255, 255, ${axisOpacity})`)
        .style('stroke-width', isPilotMode ? '0.5' : '1');

      const yAxis = g.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${xScale(0)},0)`)
        .call(d3.axisLeft(yScale).ticks(tickCount));

      yAxis.selectAll('text')
        .style('font-size', fontSize)
        .style('font-family', 'ui-monospace, SFMono-Regular, monospace')
        .style('fill', `rgba(255, 255, 255, ${axisOpacity})`);

      yAxis.selectAll('.domain, .tick line')
        .style('stroke', `rgba(255, 255, 255, ${axisOpacity})`)
        .style('stroke-width', isPilotMode ? '0.5' : '1');

      // Add robot position (origin)
      const robotRadius = Math.max(4, size * 0.015);
      g.append('circle')
        .attr('class', 'robot-circle')
        .attr('cx', xScale(0))
        .attr('cy', yScale(0))
        .attr('r', robotRadius)
        .style('fill', '#ef4444')
        .style('stroke', '#dc2626')
        .style('stroke-width', Math.max(2, size * 0.005));

      // Labels for non-pilot mode
      if (!isPilotMode) {
        g.append('text')
          .attr('class', 'x-label')
          .attr('x', width / 2)
          .attr('y', height + margin.bottom - 5)
          .style('text-anchor', 'middle')
          .style('font-size', '9px')
          .style('fill', 'rgba(255, 255, 255, 0.8)')
          .text('Distance (m)');

        g.append('text')
          .attr('class', 'y-label')
          .attr('transform', 'rotate(-90)')
          .attr('y', 0 - margin.left + 15)
          .attr('x', 0 - (height / 2))
          .style('text-anchor', 'middle')
          .style('font-size', '9px')
          .style('fill', 'rgba(255, 255, 255, 0.8)')
          .text('Distance (m)');
      }
    }

    // NOW UPDATE ONLY THE DYNAMIC DATA - this happens every frame
    const pointRadius = Math.max(1.5, size * 0.008);
    const pointColor = isPilotMode ? '#00d4ff' : '#3b82f6';
    const pointOpacity = isPilotMode ? 0.9 : 0.8;
    const strokeColor = isPilotMode ? '#0099cc' : '#1d4ed8';

    // Efficient scan points update using D3 enter/update/exit pattern
    const points = g.selectAll<SVGCircleElement, ScanPoint>('.scan-point')
      .data(scanData, d => `${d.x.toFixed(3)}-${d.y.toFixed(3)}`);

    // Remove old points
    points.exit().remove();

    // Add new points and update existing ones
    points.enter()
      .append('circle')
      .attr('class', 'scan-point')
      .attr('r', pointRadius)
      .style('fill', pointColor)
      .style('fill-opacity', pointOpacity)
      .style('stroke', strokeColor)
      .style('stroke-width', isPilotMode ? 0.25 : 0.5)
      .style('filter', isPilotMode ? 'drop-shadow(0 0 2px rgba(0, 212, 255, 0.3))' : 'none')
      .merge(points)
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y));

    // Handle "No Data" text efficiently
    const noDataText = g.select('.no-data-text');
    if (scanData.length === 0) {
      if (noDataText.empty()) {
        g.append('text')
          .attr('class', 'no-data-text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .style('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('fill', 'rgba(255, 255, 255, 0.6)')
          .text('No LiDAR Data');
      }
    } else {
      noDataText.remove();
    }

  }, [maxRange, scanData, isPilotMode]);

  // Check if we're on desktop for compact layout - Move hooks before early return


  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>LiDAR: No connection</p>
      </div>
    );
  }

  // Premium Pilot Mode LiDAR - Clean, HUD-style display
  if (isPilotMode) {
    return (
      <div className="w-full h-full relative">
        {/* Subtle frame indicator */}
        <div className="absolute inset-0 border border-white/20 rounded-lg bg-black/10 backdrop-blur-sm" />

        {/* LiDAR label - minimal, professional */}
        <div className="absolute top-2 left-2 z-10">
          <div
            className="text-xs font-mono text-white/80 uppercase tracking-wider"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
              LiDAR
          </div>
        </div>

        {/* Data status indicator - top right */}
        <div className="absolute top-2 right-2 z-10">
          <div
            className={`w-1.5 h-1.5 rounded-full ${scanData.length > 0
              ? 'bg-green-400 shadow-green-400/50 shadow-sm'
              : 'bg-amber-400 shadow-amber-400/50 shadow-sm'}`}
          />
        </div>

        {/* SVG Plot - optimized for pilot mode */}
        <div className="absolute inset-0 p-3">
          <svg className="w-full h-full" ref={svgRef} />
        </div>
      </div>
    );
  }


  return (
    <div className="w-full h-full flex flex-col" data-testid="laser-scan-visualization">
      {/* Header - Drone Operator Style */}
      <div className="px-3 py-2">
        {/* Desktop: Single row layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xs sm:text-sm font-medium text-white uppercase tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              LiDAR
            </h3>
            <div className="flex items-center gap-2">
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-40">
                  <SelectValue placeholder="Select laser scan topic..." />
                </SelectTrigger>
                <SelectContent>
                  {laserScanTopics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-white font-mono" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{scanData.length}</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <div
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              className={`px-1.5 py-0.5 rounded text-xs ${
                isSubscribed ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
              }`}
            >
              {isSubscribed ? 'Live' : 'Off'}
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-white uppercase tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              LiDAR
            </h3>
            <div
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              className={`px-2 py-1 rounded text-xs ${
                isSubscribed ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'
              }`}
            >
              {isSubscribed ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Select onValueChange={setSelectedTopic} value={selectedTopic}>
              <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-full">
                <SelectValue placeholder="Select laser scan topic..." />
              </SelectTrigger>
              <SelectContent>
                {laserScanTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center justify-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-white font-mono" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{scanData.length} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plot area */}
      <div className="flex-1 p-2 overflow-hidden">
        <div className="w-full h-full min-h-0 p-1">
          <svg className="w-full h-full chart-container" ref={svgRef}></svg>
        </div>

        {/* Status message - only show on mobile */}
        {scanData.length === 0 && isSubscribed && (
          <div className="text-center mt-4">
            <p className="text-xs text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>Waiting for scan data on {selectedTopic} topic...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(LaserScanVisualization);