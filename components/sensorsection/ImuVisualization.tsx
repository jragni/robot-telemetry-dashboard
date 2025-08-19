'use client';

import { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import * as d3 from 'd3';

import { useConnection } from '@/components/dashboard/ConnectionProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Quaternion, Vector3 } from './definitions';

interface ImuDataPoint {
  timestamp: number;
  orientation: { roll: number; pitch: number; yaw: number };
  linearAcceleration: Vector3;
  angularVelocity: Vector3;
}


interface D3Selection {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null;
  g: d3.Selection<SVGGElement, unknown, null, undefined> | null;
  xScale: d3.ScaleTime<number, number> | null;
  yScale: d3.ScaleLinear<number, number> | null;
  line: d3.Line<ImuDataPoint> | null;
  paths: Map<string, d3.Selection<SVGPathElement, unknown, null, undefined>>;
  legend: d3.Selection<SVGGElement, unknown, null, undefined> | null;
  isInitialized: boolean;
}

function ImuVisualization(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const [imuDataHistory, setImuDataHistory] = useState<ImuDataPoint[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('/imu');
  const [imuTopics, setImuTopics] = useState<string[]>(['/imu']);
  const [angularVelocityUnit, setAngularVelocityUnit] = useState<'rad/s' | 'deg/s'>('rad/s');
  const [orientationUnit, setOrientationUnit] = useState<'degrees' | 'radians'>('degrees');

  // Boolean flags for unit conversions (avoid string comparisons)
  const useDegreesForAngularVelocity = angularVelocityUnit === 'deg/s';
  const useDegreesForOrientation = orientationUnit === 'degrees';

  const orientationRef = useRef<SVGSVGElement>(null);
  const accelerationRef = useRef<SVGSVGElement>(null);
  const angularVelocityRef = useRef<SVGSVGElement>(null);

  // D3 selection state management to avoid recreation
  const orientationD3State = useRef<D3Selection>({
    svg: null, g: null, xScale: null, yScale: null, line: null,
    paths: new Map(), legend: null, isInitialized: false,
  });
  const accelerationD3State = useRef<D3Selection>({
    svg: null, g: null, xScale: null, yScale: null, line: null,
    paths: new Map(), legend: null, isInitialized: false,
  });
  const angularVelocityD3State = useRef<D3Selection>({
    svg: null, g: null, xScale: null, yScale: null, line: null,
    paths: new Map(), legend: null, isInitialized: false,
  });

  // Performance monitoring
  const performanceThreshold = 50; // 50ms render time threshold

  // Keep last 100 data points (about 5 seconds at 20Hz) - optimized for smooth UI performance
  const maxDataPoints = 100;

  // Convert quaternion to Euler angles (roll, pitch, yaw) - memoized for performance
  const quaternionToEuler = useMemo(() => {
    return (q: Quaternion) => {
      const { x, y, z, w } = q;

      // Roll (x-axis rotation)
      const sinrCosp = 2 * (w * x + y * z);
      const cosrCosp = 1 - 2 * (x * x + y * y);
      const roll = Math.atan2(sinrCosp, cosrCosp);

      // Pitch (y-axis rotation)
      const sinp = 2 * (w * y - z * x);
      const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * (Math.PI / 2) : Math.asin(sinp);

      // Yaw (z-axis rotation)
      const sinyCosp = 2 * (w * z + x * y);
      const cosyCosp = 1 - 2 * (y * y + z * z);
      const yaw = Math.atan2(sinyCosp, cosyCosp);

      return { roll, pitch, yaw };
    };
  }, []);

  // Fetch available IMU topics when connection changes
  useEffect(() => {
    if (!selectedConnection?.rosInstance) {
      setImuTopics(['/imu']);
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
          type: 'sensor_msgs/Imu',
        });

        getTopics.callService(request, (result: { topics?: string[] }) => {
          if (result?.topics && result.topics.length > 0) {
            setImuTopics(result.topics);
            if (!result.topics.includes(selectedTopic)) {
              setSelectedTopic(result.topics.includes('/imu') ? '/imu' : result.topics[0]);
            }
          } else {
            setImuTopics(['/imu']);
            setSelectedTopic('/imu');
          }
        });
      } catch (error) {
        console.warn('Failed to fetch IMU topics:', error);
        setImuTopics(['/imu']);
        setSelectedTopic('/imu');
      }
    };

    fetchTopics();
  }, [selectedConnection, selectedTopic]);

  // Subscribe to IMU topic
  useEffect(() => {
    let imuTopic: ROSLIB.Topic | null = null;

    const setupSubscription = async () => {
      if (!selectedConnection?.rosInstance || selectedConnection.status !== 'connected') {
        setIsSubscribed(false);
        setImuDataHistory([]);
        return;
      }

      const ROSLIB = await import('roslib');

      imuTopic = new ROSLIB.default.Topic({
        ros: selectedConnection.rosInstance,
        name: selectedTopic,
        messageType: 'sensor_msgs/Imu',
      });

      imuTopic.subscribe((message: any) => {
        const timestamp = Date.now();
        const euler = quaternionToEuler(message.orientation);

        const dataPoint: ImuDataPoint = {
          timestamp,
          orientation: euler,
          linearAcceleration: message.linear_acceleration,
          angularVelocity: message.angular_velocity,
        };

        setImuDataHistory(prev => {
          // Optimized array update - avoid spread operator for large arrays
          if (prev.length >= maxDataPoints) {
            const newHistory = prev.slice(1);
            newHistory.push(dataPoint);
            return newHistory;
          } else {
            return [...prev, dataPoint];
          }
        });
      });

      setIsSubscribed(true);
    };

    setupSubscription();

    return () => {
      if (imuTopic) {
        imuTopic.unsubscribe();
        setIsSubscribed(false);
      }
    };
  }, [selectedConnection, selectedTopic, quaternionToEuler, maxDataPoints]);

  // Performance monitoring utility
  const measurePerformance = useCallback((renderTime: number, _pointCount: number) => {
    // Log performance warnings if needed
    if (renderTime > performanceThreshold) {
      console.warn(`IMU render time exceeded threshold: ${renderTime.toFixed(2)}ms (threshold: ${performanceThreshold}ms)`);
    }
  }, [performanceThreshold]);

  // Optimized create time series plot with selective updates
  const createTimeSeriesPlot = useCallback((
    svgRef: React.RefObject<SVGSVGElement | null>,
    d3State: React.MutableRefObject<D3Selection>,
    data: ImuDataPoint[],
    valueAccessors: { [key: string]: (d: ImuDataPoint) => number },
    colors: { [key: string]: string },
    yLabel: string,
    yDomain?: [number, number],
  ) => {
    if (!svgRef.current) return;

    const startTime = performance.now();

    // Get container dimensions for responsive sizing
    const container = svgRef.current.parentElement;
    const containerRect = container?.getBoundingClientRect();
    const margin = { top: 15, right: 50, bottom: 35, left: 45 };

    // Use container dimensions to prevent truncation - ensure minimum height
    const containerWidth = containerRect?.width ?? 400;
    const containerHeight = Math.max(containerRect?.height ?? 200, 150);
    const width = Math.max(containerWidth - margin.left - margin.right, 200);
    const height = Math.max(containerHeight - margin.top - margin.bottom, 100);

    // Initialize D3 elements only once
    if (!d3State.current.isInitialized || !d3State.current.svg) {
      // Clear previous elements
      d3.select(svgRef.current).selectAll('*').remove();

      d3State.current.svg = d3.select(svgRef.current);
      d3State.current.svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

      d3State.current.g = d3State.current.svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      d3State.current.paths.clear();
      d3State.current.isInitialized = true;
    }

    if (data.length === 0) {
      // Clear paths when no data
      d3State.current.paths.forEach(path => path.attr('d', null));
      return;
    }

    // Create scales - use actual data range instead of fixed window
    const timeExtent = d3.extent(data, d => d.timestamp) as [number, number];
    const timeWindow = 10000; // 10 seconds default

    let xDomain: [number, number];
    if (timeExtent[0] && timeExtent[1]) {
      const dataSpan = timeExtent[1] - timeExtent[0];
      const now = Date.now();

      if (dataSpan < timeWindow) {
        xDomain = [timeExtent[0], Math.max(timeExtent[1], now)];
      } else {
        xDomain = [timeExtent[1] - timeWindow, timeExtent[1]];
      }
    } else {
      const now = Date.now();
      xDomain = [now - timeWindow, now];
    }

    const xScale = d3.scaleTime()
      .domain(xDomain)
      .range([0, width]);

    // Calculate y domain
    let yMin = 0, yMax = 0;
    if (yDomain) {
      [yMin, yMax] = yDomain;
    } else {
      const allValues = data.flatMap(d =>
        Object.values(valueAccessors).map(accessor => accessor(d)),
      );

      const validValues = allValues.filter(v =>
        isFinite(v) && !isNaN(v) && Math.abs(v) < 1000,
      );

      if (validValues.length > 0) {
        const dataMin = d3.min(validValues) ?? 0;
        const dataMax = d3.max(validValues) ?? 0;
        const range = dataMax - dataMin;
        const minRange = 0.1;

        if (range < minRange) {
          const center = (dataMin + dataMax) / 2;
          yMin = center - minRange / 2;
          yMax = center + minRange / 2;
        } else {
          const padding = Math.min(range * 0.1, 1.0);
          yMin = dataMin - padding;
          yMax = dataMax + padding;
        }

        yMin = Math.max(yMin, -100);
        yMax = Math.min(yMax, 100);
      }
    }

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Update scales references
    d3State.current.xScale = xScale;
    d3State.current.yScale = yScale;

    // Create/update axes only if necessary
    if (!d3State.current.g!.select('.x-axis').node()) {
      const xAxis = d3State.current.g!.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`);

      const yAxis = d3State.current.g!.append('g')
        .attr('class', 'y-axis');

      // Add axis labels
      d3State.current.g!.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 12)
        .attr('x', 0 - (height / 2))
        .attr('dy', '0.35em')
        .style('text-anchor', 'middle')
        .style('font-size', '9px')
        .attr('class', 'chart-axis-label')
        .text(yLabel);

      // Initialize legend container
      d3State.current.legend = d3State.current.g!.append('g')
        .attr('class', 'legend');
    }

    // Update axes
    const xAxisGenerator = d3.axisBottom(xScale)
      .ticks(4)
      .tickFormat((d) => d3.timeFormat('%M:%S')(new Date(d as number)));
    (d3State.current.g!.select('.x-axis') as any)
      .call(xAxisGenerator);

    d3State.current.g!.select('.x-axis').selectAll('text')
      .style('font-size', '10px')
      .attr('class', 'chart-axis-text');

    d3State.current.g!.select('.x-axis').selectAll('.domain, .tick line')
      .attr('class', 'chart-axis-line');

    const yAxisGenerator = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => {
        const value = Number(d);
        if (Math.abs(value) < 0.1) {
          return d3.format('.3f')(value);
        } else if (Math.abs(value) < 1) {
          return d3.format('.2f')(value);
        } else {
          return d3.format('.1f')(value);
        }
      });
    (d3State.current.g!.select('.y-axis') as any)
      .call(yAxisGenerator);

    d3State.current.g!.select('.y-axis').selectAll('text')
      .style('font-size', '10px')
      .attr('class', 'chart-axis-text');

    d3State.current.g!.select('.y-axis').selectAll('.domain, .tick line')
      .attr('class', 'chart-axis-line');

    // Create line generator
    const line = d3.line<ImuDataPoint>()
      .x(d => xScale(d.timestamp))
      .curve(d3.curveLinear);

    // Update data lines using efficient enter/update/exit pattern
    Object.entries(valueAccessors).forEach(([key, accessor], index) => {
      line.y(d => {
        const value = accessor(d);
        if (!isFinite(value) || isNaN(value)) {
          return yScale((yMin + yMax) / 2);
        }
        const clampedValue = Math.max(yMin, Math.min(yMax, value));
        const scaledValue = yScale(clampedValue);
        return Math.max(0, Math.min(height, scaledValue));
      });

      // Get or create path for this data series
      if (!d3State.current.paths.has(key)) {
        const path = d3State.current.g!.append('path')
          .attr('class', `line-${key}`)
          .attr('fill', 'none')
          .attr('stroke', colors[key] ?? '#000000')
          .attr('stroke-width', 2);
        d3State.current.paths.set(key, path);
      }

      // Update path data with smooth transition
      const path = d3State.current.paths.get(key)!;
      path.datum(data)
        .transition()
        .duration(100)
        .attr('d', line);

      // Update legend
      const legendY = index * 14;

      // Legend circle
      let legendCircle = d3State.current.legend!.select<SVGCircleElement>(`.legend-circle-${key}`);
      if (legendCircle.empty()) {
        legendCircle = d3State.current.legend!.append('circle')
          .attr('class', `legend-circle-${key}`);
      }
      legendCircle
        .attr('cx', width + 6)
        .attr('cy', legendY + 5)
        .attr('r', 2.5)
        .style('fill', colors[key] ?? '#000000');

      // Legend text
      let legendText = d3State.current.legend!.select<SVGTextElement>(`.legend-text-${key}`);
      if (legendText.empty()) {
        legendText = d3State.current.legend!.append('text')
          .attr('class', `legend-text-${key} chart-legend-text`);
      }
      legendText
        .attr('x', width + 12)
        .attr('y', legendY + 5)
        .attr('dy', '0.35em')
        .style('font-size', '9px')
        .text(key);
    });

    const endTime = performance.now();
    measurePerformance(endTime - startTime, data.length);
  }, [measurePerformance]);

  // Draw orientation time series
  useEffect(() => {
    const orientationMultiplier = useDegreesForOrientation ? 180 / Math.PI : 1;
    const orientationLabel = `Angle (${orientationUnit})`;
    const orientationDomain = useDegreesForOrientation ? [-180, 180] : [-Math.PI, Math.PI];

    createTimeSeriesPlot(
      orientationRef,
      orientationD3State,
      imuDataHistory,
      {
        'Roll': d => d.orientation.roll * orientationMultiplier,
        'Pitch': d => d.orientation.pitch * orientationMultiplier,
        'Yaw': d => d.orientation.yaw * orientationMultiplier,
      },
      {
        'Roll': '#ef4444',
        'Pitch': '#3b82f6',
        'Yaw': '#22c55e',
      },
      orientationLabel,
      orientationDomain as [number, number],
    );
  }, [imuDataHistory, createTimeSeriesPlot, useDegreesForOrientation, orientationUnit]);

  // Draw acceleration time series
  useEffect(() => {
    createTimeSeriesPlot(
      accelerationRef,
      accelerationD3State,
      imuDataHistory,
      {
        'X': d => d.linearAcceleration.x,
        'Y': d => d.linearAcceleration.y,
        'Z': d => d.linearAcceleration.z,
      },
      {
        'X': '#ef4444',
        'Y': '#22c55e',
        'Z': '#3b82f6',
      },
      'Acceleration (m/s²)',
    );
  }, [imuDataHistory, createTimeSeriesPlot]);

  // Draw angular velocity time series
  useEffect(() => {
    const unitMultiplier = useDegreesForAngularVelocity ? 180 / Math.PI : 1;
    const yLabel = `Angular Velocity (${angularVelocityUnit})`;

    createTimeSeriesPlot(
      angularVelocityRef,
      angularVelocityD3State,
      imuDataHistory,
      {
        'ωx': d => d.angularVelocity.x * unitMultiplier,
        'ωy': d => d.angularVelocity.y * unitMultiplier,
        'ωz': d => d.angularVelocity.z * unitMultiplier,
      },
      {
        'ωx': '#ef4444',
        'ωy': '#22c55e',
        'ωz': '#3b82f6',
      },
      yLabel,
    );
  }, [imuDataHistory, createTimeSeriesPlot, angularVelocityUnit, useDegreesForAngularVelocity]);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clear D3 selections and event listeners
      [orientationD3State, accelerationD3State, angularVelocityD3State].forEach(state => {
        if (state.current.svg) {
          state.current.svg.selectAll('*').remove();
          state.current.svg = null;
          state.current.g = null;
          state.current.xScale = null;
          state.current.yScale = null;
          state.current.line = null;
          state.current.paths.clear();
          state.current.legend = null;
          state.current.isInitialized = false;
        }
      });

      // Clear performance metrics
    };
  }, []);


  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <div className="w-full bg-gray-800 border border-gray-600 rounded flex items-center justify-center h-16 text-gray-400">
        <p className="text-sm">IMU: No connection</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 border border-gray-600 rounded flex flex-col">
      {/* Header - Drone Operator Style */}
      <div className="px-3 py-2 bg-gray-900/80 border-b border-gray-600">
        {/* Desktop: Single row layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-100 uppercase tracking-wide">
              IMU
            </h3>
            <div className="flex items-center gap-2">
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-40">
                  <SelectValue placeholder="Select IMU topic..." />
                </SelectTrigger>
                <SelectContent>
                  {imuTopics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={(value: 'degrees' | 'radians') => setOrientationUnit(value)} value={orientationUnit}>
                <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="degrees">deg</SelectItem>
                  <SelectItem value="radians">rad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Select onValueChange={(value: 'rad/s' | 'deg/s') => setAngularVelocityUnit(value)} value={angularVelocityUnit}>
                <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deg/s">deg/s</SelectItem>
                  <SelectItem value="rad/s">rad/s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isSubscribed ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <div className={`px-2 py-1 rounded text-xs ${
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
              IMU
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
                <SelectValue placeholder="Select IMU topic..." />
              </SelectTrigger>
              <SelectContent>
                {imuTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select onValueChange={(value: 'degrees' | 'radians') => setOrientationUnit(value)} value={orientationUnit}>
                <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="degrees">deg</SelectItem>
                  <SelectItem value="radians">rad</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value: 'rad/s' | 'deg/s') => setAngularVelocityUnit(value)} value={angularVelocityUnit}>
                <SelectTrigger className="h-7 text-xs bg-gray-700 border-gray-500 text-gray-200 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deg/s">deg/s</SelectItem>
                  <SelectItem value="rad/s">rad/s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-3 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Orientation Time Series */}
          <div className="border rounded-lg bg-white dark:bg-gray-800 p-3 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Orientation</h4>
            <div className="flex justify-center overflow-hidden">
              <svg className="max-w-full h-auto chart-container" ref={orientationRef}></svg>
            </div>
          </div>

          {/* Acceleration Time Series */}
          <div className="border rounded-lg bg-white dark:bg-gray-800 p-3 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Linear Acceleration</h4>
            <div className="flex justify-center overflow-hidden">
              <svg className="max-w-full h-auto chart-container" ref={accelerationRef}></svg>
            </div>
          </div>

          {/* Angular Velocity Time Series */}
          <div className="border rounded-lg bg-white dark:bg-gray-800 p-3 min-w-0">
            <h4 className="text-xs sm:text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">Angular Velocity</h4>
            <div className="flex justify-center overflow-hidden">
              <svg className="max-w-full h-auto chart-container" ref={angularVelocityRef}></svg>
            </div>
          </div>
        </div>

        {imuDataHistory.length === 0 && isSubscribed && (
          <div className="text-center text-gray-500 mt-4">
            <p>Waiting for IMU data on {selectedTopic} topic...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(ImuVisualization);