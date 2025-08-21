import { vi, expect } from 'vitest';
import { RenderResult, waitFor } from '@testing-library/react';

// Performance measurement utilities
export interface PerformanceMetrics {
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  reRenderCount: number;
}

// Mock performance observer for testing
export const createMockPerformanceObserver = () => {
  const entries: PerformanceEntry[] = [];
  
  const mockObserver = vi.fn().mockImplementation((callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => entries),
  }));
  
  // Add entries for testing
  const addEntry = (entry: Partial<PerformanceEntry>) => {
    entries.push({
      name: 'test-entry',
      entryType: 'measure',
      startTime: 0,
      duration: 0,
      ...entry,
    } as PerformanceEntry);
  };
  
  global.PerformanceObserver = mockObserver;
  
  return { mockObserver, addEntry, entries };
};

// Measure render performance
export const measureRenderPerformance = async (renderFn: () => RenderResult): Promise<PerformanceMetrics> => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  let reRenderCount = 0;
  
  // Mock React's profiler
  const originalConsoleTime = console.time;
  const originalConsoleTimeEnd = console.timeEnd;
  
  console.time = vi.fn();
  console.timeEnd = vi.fn();
  
  const rendered = renderFn();
  
  const renderTime = performance.now() - startTime;
  
  // Measure update performance
  const updateStartTime = performance.now();
  rendered.rerender(rendered.container.firstChild as any);
  const updateTime = performance.now() - updateStartTime;
  
  const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
  const memoryUsage = endMemory - startMemory;
  
  // Restore console methods
  console.time = originalConsoleTime;
  console.timeEnd = originalConsoleTimeEnd;
  
  return {
    renderTime,
    updateTime,
    memoryUsage,
    reRenderCount,
  };
};

// Test component responsiveness under load
export const testComponentUnderLoad = async (
  rendered: RenderResult,
  loadConfig: {
    updates: number;
    interval: number;
    dataSize: number;
  }
): Promise<PerformanceMetrics> => {
  const { updates, interval, dataSize } = loadConfig;
  const startTime = performance.now();
  let reRenderCount = 0;
  
  // Create large dataset to simulate heavy load
  const largeData = new Array(dataSize).fill(0).map((_, i) => ({
    id: i,
    value: Math.random(),
    timestamp: Date.now() + i,
  }));
  
  // Simulate rapid updates
  for (let i = 0; i < updates; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));
    
    // Trigger re-render with new data
    const newData = largeData.map(item => ({
      ...item,
      value: Math.random(),
      timestamp: Date.now(),
    }));
    
    reRenderCount++;
    
    // Force component update (this would be done through props in real testing)
    rendered.rerender(rendered.container.firstChild as any);
  }
  
  const totalTime = performance.now() - startTime;
  
  return {
    renderTime: totalTime,
    updateTime: totalTime / updates,
    memoryUsage: 0, // Would need real memory measurement
    reRenderCount,
  };
};

// Test real-time data visualization performance
export const testVisualizationPerformance = async (
  renderVisualization: () => RenderResult,
  dataGenerator: () => any,
  config: {
    frequency: number; // Hz
    duration: number; // seconds
    dataPoints: number;
  }
): Promise<PerformanceMetrics> => {
  const { frequency, duration, dataPoints } = config;
  const rendered = renderVisualization();
  
  const startTime = performance.now();
  const updates = frequency * duration;
  let reRenderCount = 0;
  
  // Simulate real-time data stream
  for (let i = 0; i < updates; i++) {
    const data = Array.from({ length: dataPoints }, () => dataGenerator());
    
    // Wait for next frame
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        reRenderCount++;
        resolve(undefined);
      });
    });
    
    // Simulate data update (would trigger through props)
    rendered.rerender(rendered.container.firstChild as any);
    
    // Wait for the interval
    await new Promise(resolve => setTimeout(resolve, 1000 / frequency));
  }
  
  const totalTime = performance.now() - startTime;
  
  return {
    renderTime: totalTime,
    updateTime: totalTime / updates,
    memoryUsage: 0,
    reRenderCount,
  };
};

// Memory leak detection
export const detectMemoryLeaks = async (
  renderFn: () => RenderResult,
  iterations: number = 100
): Promise<{
  memoryGrowth: number;
  averageRenderTime: number;
  leaked: boolean;
}> => {
  const renderTimes: number[] = [];
  const memorySnapshots: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const startTime = performance.now();
    
    const rendered = renderFn();
    
    const renderTime = performance.now() - startTime;
    renderTimes.push(renderTime);
    
    // Simulate component lifecycle
    rendered.unmount();
    
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
    memorySnapshots.push(endMemory - startMemory);
    
    // Small delay to allow cleanup
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // Calculate memory growth trend
  const firstHalfAvg = memorySnapshots.slice(0, iterations / 2)
    .reduce((sum, val) => sum + val, 0) / (iterations / 2);
  const secondHalfAvg = memorySnapshots.slice(iterations / 2)
    .reduce((sum, val) => sum + val, 0) / (iterations / 2);
  
  const memoryGrowth = secondHalfAvg - firstHalfAvg;
  const averageRenderTime = renderTimes.reduce((sum, val) => sum + val, 0) / iterations;
  
  // Consider it a leak if memory grows by more than 50%
  const leaked = memoryGrowth > firstHalfAvg * 0.5;
  
  return {
    memoryGrowth,
    averageRenderTime,
    leaked,
  };
};

// Test D3 chart performance
export const testD3Performance = async (
  svgElement: SVGSVGElement,
  dataPoints: number,
  operations: ('render' | 'update' | 'transition')[]
): Promise<PerformanceMetrics> => {
  const startTime = performance.now();
  let reRenderCount = 0;
  
  // Generate test data
  const data = Array.from({ length: dataPoints }, (_, i) => ({
    x: i,
    y: Math.random() * 100,
    id: `point-${i}`,
  }));
  
  for (const operation of operations) {
    const operationStart = performance.now();
    
    switch (operation) {
      case 'render':
        // Simulate D3 rendering
        const circles = Array.from({ length: dataPoints }, (_, i) => {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', String(data[i].x));
          circle.setAttribute('cy', String(data[i].y));
          circle.setAttribute('r', '2');
          return circle;
        });
        circles.forEach(circle => svgElement.appendChild(circle));
        break;
        
      case 'update':
        // Simulate data update
        const existingCircles = svgElement.querySelectorAll('circle');
        existingCircles.forEach((circle, i) => {
          if (data[i]) {
            circle.setAttribute('cy', String(Math.random() * 100));
          }
        });
        break;
        
      case 'transition':
        // Simulate transition (mock)
        await new Promise(resolve => setTimeout(resolve, 300));
        break;
    }
    
    reRenderCount++;
    
    // Force layout recalculation
    svgElement.getBoundingClientRect();
  }
  
  const totalTime = performance.now() - startTime;
  
  return {
    renderTime: totalTime,
    updateTime: totalTime / operations.length,
    memoryUsage: 0,
    reRenderCount,
  };
};

// Performance assertions
export const assertPerformance = (
  metrics: PerformanceMetrics,
  thresholds: Partial<PerformanceMetrics>
) => {
  if (thresholds.renderTime !== undefined) {
    expect(metrics.renderTime).toBeLessThan(thresholds.renderTime);
  }
  
  if (thresholds.updateTime !== undefined) {
    expect(metrics.updateTime).toBeLessThan(thresholds.updateTime);
  }
  
  if (thresholds.memoryUsage !== undefined) {
    expect(metrics.memoryUsage).toBeLessThan(thresholds.memoryUsage);
  }
  
  if (thresholds.reRenderCount !== undefined) {
    expect(metrics.reRenderCount).toBeLessThanOrEqual(thresholds.reRenderCount);
  }
};

// Benchmark test runner
export const runPerformanceBenchmark = async (
  testName: string,
  testFn: () => Promise<PerformanceMetrics>,
  thresholds: Partial<PerformanceMetrics>,
  iterations: number = 5
): Promise<PerformanceMetrics[]> => {
  console.log(`Running performance benchmark: ${testName}`);
  
  const results: PerformanceMetrics[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const metrics = await testFn();
    results.push(metrics);
    assertPerformance(metrics, thresholds);
  }
  
  // Calculate averages
  const averages: PerformanceMetrics = {
    renderTime: results.reduce((sum, r) => sum + r.renderTime, 0) / iterations,
    updateTime: results.reduce((sum, r) => sum + r.updateTime, 0) / iterations,
    memoryUsage: results.reduce((sum, r) => sum + r.memoryUsage, 0) / iterations,
    reRenderCount: results.reduce((sum, r) => sum + r.reRenderCount, 0) / iterations,
  };
  
  console.log(`Benchmark ${testName} completed:`, averages);
  
  return results;
};