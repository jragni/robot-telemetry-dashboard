'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

import { useConnection } from '@/components/dashboard/ConnectionProvider';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ImuMessage, Quaternion, Vector3 } from './definitions';

interface ImuDataPoint {
  timestamp: number;
  orientation: { roll: number; pitch: number; yaw: number };
  linearAcceleration: Vector3;
  angularVelocity: Vector3;
}

export default function ImuVisualization(): React.ReactNode {
  const { selectedConnection } = useConnection();
  const orientationRef = useRef<SVGSVGElement>(null);
  const accelerationRef = useRef<SVGSVGElement>(null);
  const angularVelocityRef = useRef<SVGSVGElement>(null);
  const [imuDataHistory, setImuDataHistory] = useState<ImuDataPoint[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>('/imu');
  const [imuTopics, setImuTopics] = useState<string[]>(['/imu']);
  
  // Keep last 100 data points (about 10 seconds at 10Hz)
  const maxDataPoints = 100;

  // Convert quaternion to Euler angles (roll, pitch, yaw)
  const quaternionToEuler = useCallback((q: Quaternion) => {
    const { x, y, z, w } = q;
    
    // Roll (x-axis rotation)
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp);

    // Pitch (y-axis rotation)
    const sinp = 2 * (w * y - z * x);
    const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);

    // Yaw (z-axis rotation)
    const siny_cosp = 2 * (w * z + x * y);
    const cosy_cosp = 1 - 2 * (y * y + z * z);
    const yaw = Math.atan2(siny_cosp, cosy_cosp);

    return { roll, pitch, yaw };
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

        getTopics.callService(request, (result: any) => {
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
        setImuData(null);
        return;
      }

      const ROSLIB = await import('roslib');

      imuTopic = new ROSLIB.default.Topic({
        ros: selectedConnection.rosInstance,
        name: selectedTopic,
        messageType: 'sensor_msgs/Imu',
      });

      imuTopic.subscribe((message: ImuMessage) => {
        const timestamp = Date.now();
        const euler = quaternionToEuler(message.orientation);
        
        const dataPoint: ImuDataPoint = {
          timestamp,
          orientation: euler,
          linearAcceleration: message.linear_acceleration,
          angularVelocity: message.angular_velocity,
        };
        
        setImuDataHistory(prev => {
          const newHistory = [...prev, dataPoint];
          return newHistory.slice(-maxDataPoints);
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

  // Create time series plot
  const createTimeSeriesPlot = useCallback((
    svgRef: React.RefObject<SVGSVGElement>,
    data: ImuDataPoint[],
    valueAccessors: { [key: string]: (d: ImuDataPoint) => number },
    colors: { [key: string]: string },
    yLabel: string,
    yDomain?: [number, number]
  ) => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 10, right: 60, bottom: 30, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 180 - margin.top - margin.bottom;

    svg.selectAll('*').remove();
    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales - use actual data range instead of fixed window
    const timeExtent = d3.extent(data, d => d.timestamp) as [number, number];
    let timeWindow = 10000; // 10 seconds default
    
    let xDomain: [number, number];
    if (timeExtent[0] && timeExtent[1]) {
      const dataSpan = timeExtent[1] - timeExtent[0];
      const now = Date.now();
      
      if (dataSpan < timeWindow) {
        // If data spans less than 10 seconds, show from first data point to now
        xDomain = [timeExtent[0], Math.max(timeExtent[1], now)];
      } else {
        // If data spans more than 10 seconds, show last 10 seconds of data
        xDomain = [timeExtent[1] - timeWindow, timeExtent[1]];
      }
    } else {
      // Fallback to current time window
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
      const allValues = data.flatMap(d => Object.values(valueAccessors).map(accessor => accessor(d)));
      yMin = d3.min(allValues) || 0;
      yMax = d3.max(allValues) || 0;
      const padding = (yMax - yMin) * 0.1;
      yMin -= padding;
      yMax += padding;
    }

    const yScale = d3.scaleLinear()
      .domain([yMin, yMax])
      .range([height, 0]);

    // Add axes with better formatting
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(4)
        .tickFormat(d3.timeFormat('%M:%S'))
      )
      .selectAll('text')
      .style('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d3.format('.1f'))
      )
      .selectAll('text')
      .style('font-size', '10px');

    // Add axis labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left + 15)
      .attr('x', 0 - (height / 2))
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#666')
      .text(yLabel);

    // Create line generator
    const line = d3.line<ImuDataPoint>()
      .x(d => xScale(d.timestamp))
      .curve(d3.curveLinear);

    // Draw lines for each data series
    Object.entries(valueAccessors).forEach(([key, accessor]) => {
      line.y(d => yScale(accessor(d)));
      
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors[key] || '#000000')
        .attr('stroke-width', 2)
        .attr('d', line);

      // Add legend
      const legendY = Object.keys(valueAccessors).indexOf(key) * 16;
      g.append('circle')
        .attr('cx', width + 8)
        .attr('cy', legendY)
        .attr('r', 3)
        .style('fill', colors[key] || '#000000');

      g.append('text')
        .attr('x', width + 16)
        .attr('y', legendY)
        .attr('dy', '0.35em')
        .style('font-size', '10px')
        .style('fill', '#333')
        .text(key);
    });
  }, []);

  // Draw orientation time series
  useEffect(() => {
    createTimeSeriesPlot(
      orientationRef,
      imuDataHistory,
      {
        'Roll': d => d.orientation.roll * 180 / Math.PI,
        'Pitch': d => d.orientation.pitch * 180 / Math.PI,
        'Yaw': d => d.orientation.yaw * 180 / Math.PI,
      },
      {
        'Roll': '#ef4444',
        'Pitch': '#3b82f6',
        'Yaw': '#22c55e',
      },
      'Angle (degrees)',
      [-180, 180]
    );
  }, [imuDataHistory, createTimeSeriesPlot]);

  // Draw acceleration time series
  useEffect(() => {
    createTimeSeriesPlot(
      accelerationRef,
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
      'Acceleration (m/s²)'
    );
  }, [imuDataHistory, createTimeSeriesPlot]);

  // Draw angular velocity time series
  useEffect(() => {
    createTimeSeriesPlot(
      angularVelocityRef,
      imuDataHistory,
      {
        'ωx': d => d.angularVelocity.x * 180 / Math.PI,
        'ωy': d => d.angularVelocity.y * 180 / Math.PI,
        'ωz': d => d.angularVelocity.z * 180 / Math.PI,
      },
      {
        'ωx': '#ef4444',
        'ωy': '#22c55e',
        'ωz': '#3b82f6',
      },
      'Angular Velocity (°/s)'
    );
  }, [imuDataHistory, createTimeSeriesPlot]);

  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No connection available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">IMU Visualization</h3>
          <div className="flex items-center gap-2">
            <Label htmlFor="imu-topic-select" className="text-sm">Topic:</Label>
            <Select onValueChange={setSelectedTopic} value={selectedTopic}>
              <SelectTrigger className="w-48">
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
        </div>
        <div className={`px-2 py-1 rounded text-xs ${
          isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {isSubscribed ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Orientation Time Series */}
        <div className="border rounded-lg bg-white p-3">
          <h4 className="text-sm font-semibold mb-2">Orientation</h4>
          <div className="flex justify-center">
            <svg ref={orientationRef} className="max-w-full h-auto"></svg>
          </div>
        </div>

        {/* Acceleration Time Series */}
        <div className="border rounded-lg bg-white p-3">
          <h4 className="text-sm font-semibold mb-2">Linear Acceleration</h4>
          <div className="flex justify-center">
            <svg ref={accelerationRef} className="max-w-full h-auto"></svg>
          </div>
        </div>

        {/* Angular Velocity Time Series */}
        <div className="border rounded-lg bg-white p-3">
          <h4 className="text-sm font-semibold mb-2">Angular Velocity</h4>
          <div className="flex justify-center">
            <svg ref={angularVelocityRef} className="max-w-full h-auto"></svg>
          </div>
        </div>
      </div>

      {imuDataHistory.length === 0 && isSubscribed && (
        <div className="text-center text-gray-500 mt-4">
          <p>Waiting for IMU data on {selectedTopic} topic...</p>
        </div>
      )}
    </div>
  );
}