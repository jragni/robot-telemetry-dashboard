import '@testing-library/jest-dom';
import 'vitest-canvas-mock';
import { beforeEach, afterEach, vi } from 'vitest';
import React from 'react';

// Make React globally available for JSX
global.React = React;

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock HTMLElement.getBoundingClientRect
  HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
    bottom: 0,
    height: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: vi.fn(),
  }));

  // Mock pointer capture methods for Radix UI
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();

  // Mock DOM methods for next-themes
  HTMLElement.prototype.remove = vi.fn();
  HTMLElement.prototype.setAttribute = vi.fn();
  HTMLElement.prototype.getAttribute = vi.fn(() => null);
  HTMLElement.prototype.removeAttribute = vi.fn();

  // Mock document.head for next-themes
  if (!document.head) {
    document.head = document.createElement('head');
  }
  document.head.appendChild = vi.fn();
  document.head.removeChild = vi.fn();
  document.head.querySelector = vi.fn(() => null);
  document.head.querySelectorAll = vi.fn(() => []);
  
  // Mock document.documentElement for next-themes
  if (!document.documentElement) {
    document.documentElement = document.createElement('html');
  }
  document.documentElement.style = {};

  // Mock SVG methods for D3
  (SVGElement.prototype as any).getBBox = vi.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  }));

  // Mock canvas methods
  (HTMLCanvasElement.prototype as any).getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 10 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  }));

  // Mock crypto.randomUUID for uuid generation
  Object.defineProperty(global, 'crypto', {
    value: {
      randomUUID: vi.fn(() => 'test-uuid-1234'),
    },
  });

  // Suppress unhandled promise rejections during tests
  // This is common for tests with complex async third-party libraries
  const originalUnhandledRejection = process.listeners('unhandledRejection');
  process.removeAllListeners('unhandledRejection');
  process.on('unhandledRejection', (reason, promise) => {
    // Only suppress ROSLIB-related errors, let others through
    if (reason && typeof reason === 'object' && 'message' in reason) {
      const message = (reason as Error).message;
      if (message.includes('callOnConnection') || message.includes('ROSLIB')) {
        // Suppress ROSLIB-related unhandled rejections
        return;
      }
    }
    // Re-emit other unhandled rejections
    originalUnhandledRejection.forEach(listener => {
      if (typeof listener === 'function') {
        listener(reason, promise);
      }
    });
  });

  // Mock setTimeout and clearTimeout for better test control
  // Keep the real implementations to avoid breaking test library timers
  // Just stub setInterval and clearInterval which we mock explicitly
  vi.stubGlobal('setInterval', vi.fn());
  vi.stubGlobal('clearInterval', vi.fn());
});

afterEach(() => {
  // Cleanup after each test
  vi.restoreAllMocks();
});