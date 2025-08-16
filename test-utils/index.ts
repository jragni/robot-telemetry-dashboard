// Re-export all test utilities
export * from './renderWithProviders';
export * from './mockRosConnection';
export * from './mockSensorData';
export * from './accessibility';
export * from './performance';

// Common test helpers
export const waitForNextTick = () => new Promise(resolve => process.nextTick(resolve));
export const waitForAnimationFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
export const waitForTimeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock implementations for common browser APIs
export const mockBrowserAPIs = () => {
  // Mock MediaDevices API for camera testing
  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [{ stop: vi.fn() }],
      }),
      enumerateDevices: vi.fn().mockResolvedValue([
        { deviceId: 'camera1', kind: 'videoinput', label: 'Test Camera' },
      ]),
    },
  });

  // Mock Fullscreen API
  Object.defineProperty(document, 'fullscreenElement', {
    value: null,
    writable: true,
  });
  
  Object.defineProperty(document, 'exitFullscreen', {
    value: vi.fn().mockResolvedValue(undefined),
  });
  
  Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', {
    value: vi.fn().mockResolvedValue(undefined),
  });

  // Mock Clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue('test'),
    },
  });
};