'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

import { useConnection } from '@/components/dashboard/ConnectionProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { LaserScanMessage, ScanPoint } from './definitions';

export default function LaserScanVisualization(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const svgRef = useRef<SVGSVGElement>(null);
  const [scanData, setScanData] = useState<ScanPoint[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('/scan');
  const [laserScanTopics, setLaserScanTopics] = useState<string[]>(['/scan']);

  // NOTE arbitrarily set for best visualization of objects within close proximity
  const maxRange = 5;

  const processLaserScan = useCallback((message: LaserScanMessage) => {
    const points: ScanPoint[] = [];

    message.ranges.forEach((range, index) => {
      if (
        range >= message.range_min
        && range <= message.range_max
        && !isNaN(range)
        && isFinite(range)
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
    });

    setScanData(points);
  }, []);

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
    if (!svgRef.current || scanData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const container = svgRef.current.parentElement;

    // Get container dimensions for responsive sizing
    const containerRect = container?.getBoundingClientRect();
    const margin = { top: 15, right: 20, bottom: 30, left: 30 };

    // Make square dimensions based on smaller container dimension
    const containerWidth = (containerRect?.width ?? 300);
    const containerHeight = (containerRect?.height ?? 300);
    const availableWidth = containerWidth - margin.left - margin.right;
    const availableHeight = containerHeight - margin.top - margin.bottom;

    // Ensure square aspect ratio by using the smaller dimension
    const size = Math.min(Math.max(availableWidth, 200), Math.max(availableHeight, 200));
    const width = size;
    const height = size;

    svg.selectAll('*').remove();

    const xScale = d3.scaleLinear()
      .domain([-maxRange, maxRange])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([-maxRange, maxRange])
      .range([height, 0]);

    // Set responsive dimensions to fill container
    svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

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
      .attr('class', 'chart-grid-line');

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
      .attr('class', 'chart-grid-line');

    // Add axes with fewer ticks and dark mode support
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${yScale(0)})`)
      .call(d3.axisBottom(xScale).ticks(5));

    xAxis.selectAll('text')
      .style('font-size', '10px')
      .attr('class', 'chart-axis-text');

    xAxis.selectAll('.domain, .tick line')
      .attr('class', 'chart-axis-line');

    const yAxis = g.append('g')
      .attr('transform', `translate(${xScale(0)},0)`)
      .call(d3.axisLeft(yScale).ticks(5));

    yAxis.selectAll('text')
      .style('font-size', '10px')
      .attr('class', 'chart-axis-text');

    yAxis.selectAll('.domain, .tick line')
      .attr('class', 'chart-axis-line');

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

    // Add labels with proper spacing
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 5)
      .style('text-anchor', 'middle')
      .style('font-size', '9px')
      .attr('class', 'chart-axis-label')
      .text('Distance (m)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 15)
      .attr('x', 0 - (height / 2))
      .style('text-anchor', 'middle')
      .style('font-size', '9px')
      .attr('class', 'chart-axis-label')
      .text('Distance (m)');

  }, [maxRange, scanData]);

  // Check if we're on desktop for compact layout - Move hooks before early return


  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <div className="w-full h-full bg-gray-800 border border-gray-600 rounded flex items-center justify-center text-gray-400">
        <p className="text-sm">LiDAR: No connection</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-800 border border-gray-600 rounded flex flex-col">
      {/* Header - Drone Operator Style */}
      <div className="px-3 py-2 bg-gray-900/80 border-b border-gray-600">
        {/* Desktop: Single row layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-100 uppercase tracking-wide">
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
              <span className="text-gray-300 font-mono">{scanData.length}</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <div className={`px-1.5 py-0.5 rounded text-xs ${
              isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isSubscribed ? 'Live' : 'Off'}
            </div>
          </div>
        </div>

        {/* Mobile: Stacked layout */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-medium text-gray-100 uppercase tracking-wide">
              LiDAR
            </h3>
            <div className={`px-2 py-1 rounded text-xs ${
              isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
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
                <span className="text-gray-300 font-mono">{scanData.length} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plot area */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="w-full h-full min-h-0 border rounded-lg bg-white dark:bg-gray-800 p-2">
          <svg className="w-full h-full chart-container" ref={svgRef}></svg>
        </div>

        {/* Status message - only show on mobile */}
        {scanData.length === 0 && isSubscribed && (
          <div className="text-center text-gray-400 mt-4">
            <p className="text-xs">Waiting for scan data on {selectedTopic} topic...</p>
          </div>
        )}
      </div>
    </div>
  );
}