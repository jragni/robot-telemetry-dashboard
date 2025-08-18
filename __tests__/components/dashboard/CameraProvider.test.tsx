import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CameraProvider, useCamera } from '@/components/dashboard/CameraProvider';

// Mock the ConnectionProvider
const mockConnectionProvider = {
  selectedConnection: {
    rosInstance: {
      callService: vi.fn(),
    },
    status: 'connected',
    name: 'Test Robot',
  },
};

vi.mock('@/components/dashboard/ConnectionProvider', () => ({
  useConnection: () => mockConnectionProvider,
}));

// Mock ROSLIB
const mockROSLIB = {
  Service: vi.fn(),
  ServiceRequest: vi.fn(),
  Topic: vi.fn(),
};

vi.mock('roslib', () => ({
  default: mockROSLIB,
}));

// Test component to access camera context
function TestComponent() {
  const {
    imageTopics,
    selectedTopic,
    setSelectedTopic,
    isStreamingEnabled,
    setIsStreamingEnabled,
  } = useCamera();

  return (
    <div>
      <div data-testid="topic-count">{imageTopics.length}</div>
      <div data-testid="selected-topic">{selectedTopic}</div>
      <div data-testid="streaming-enabled">{isStreamingEnabled.toString()}</div>
      <select
        data-testid="topic-selector"
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
      >
        {imageTopics.map((topic) => (
          <option key={topic.name} value={topic.name}>
            {topic.name} ({topic.type})
          </option>
        ))}
      </select>
      <button
        data-testid="toggle-streaming"
        onClick={() => setIsStreamingEnabled(!isStreamingEnabled)}
      >
        {isStreamingEnabled ? 'Stop' : 'Start'}
      </button>
    </div>
  );
}

describe('CameraProvider', () => {
  let mockService: any;
  let mockServiceRequest: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockService = {
      callService: vi.fn(),
    };
    
    mockServiceRequest = {
      type: '',
    };

    mockROSLIB.Service.mockReturnValue(mockService);
    mockROSLIB.ServiceRequest.mockImplementation((config) => ({ ...config }));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Topic Detection', () => {
    it('should detect sensor_msgs/msg/CompressedImage topics', async () => {
      // Setup mock service responses
      mockService.callService.mockImplementation((request: any, callback: any) => {
        if (request.type === 'sensor_msgs/msg/CompressedImage') {
          callback({
            topics: [
              '/camera/image_raw/compressed',
              '/camera/image/compressed',
              '/front_camera/compressed',
            ],
          });
        } else {
          callback({ topics: [] });
        }
      });

      render(
        <CameraProvider>
          <TestComponent />
        </CameraProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('topic-count')).toHaveTextContent('3');
      });

      // Verify the topics are compressed type
      const selector = screen.getByTestId('topic-selector');
      const options = selector.querySelectorAll('option');
      
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent('/camera/image_raw/compressed (compressed)');
      expect(options[1]).toHaveTextContent('/camera/image/compressed (compressed)');
      expect(options[2]).toHaveTextContent('/front_camera/compressed (compressed)');
    });


    it('should detect mixed topic types and prioritize correctly', async () => {
      mockService.callService.mockImplementation((request: any, callback: any) => {
        if (request.type === 'sensor_msgs/msg/CompressedImage') {
          callback({
            topics: ['/camera/image/compressed'],
          });
        } else {
          callback({
            topics: ['/camera/image_raw'],
          });
        }
      });

      render(
        <CameraProvider>
          <TestComponent />
        </CameraProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('topic-count')).toHaveTextContent('2');
      });

      // Should prioritize compressed topic as selected
      expect(screen.getByTestId('selected-topic')).toHaveTextContent('/camera/image/compressed');
    });

    it('should use correct message types for service requests', async () => {
      render(
        <CameraProvider>
          <TestComponent />
        </CameraProvider>
      );

      await waitFor(() => {
        expect(mockROSLIB.ServiceRequest).toHaveBeenCalledWith({
          type: 'sensor_msgs/msg/CompressedImage',
        });
        expect(mockROSLIB.ServiceRequest).toHaveBeenCalledWith({
          type: 'sensor_msgs/msg/Image',
        });
      });
    });

    it('should fallback to default topics when service fails', async () => {
      mockService.callService.mockImplementation((request: any, callback: any) => {
        callback({ topics: [] });
      });

      render(
        <CameraProvider>
          <TestComponent />
        </CameraProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('topic-count')).toHaveTextContent('1');
      });

      expect(screen.getByTestId('selected-topic')).toHaveTextContent('/camera/image_raw/compressed');
    });
  });

  describe('Topic Selection', () => {
    it('should allow switching between topics', async () => {
      mockService.callService.mockImplementation((request: any, callback: any) => {
        if (request.type === 'sensor_msgs/msg/CompressedImage') {
          callback({
            topics: ['/camera1/compressed', '/camera2/compressed'],
          });
        } else {
          callback({ topics: [] });
        }
      });

      render(
        <CameraProvider>
          <TestComponent />
        </CameraProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('selected-topic')).toHaveTextContent('/camera1/compressed');
      });

      // Change selection
      const selector = screen.getByTestId('topic-selector');
      selector.value = '/camera2/compressed';
      selector.dispatchEvent(new Event('change', { bubbles: true }));

      expect(screen.getByTestId('selected-topic')).toHaveTextContent('/camera2/compressed');
    });
  });

  describe('Streaming Control', () => {
    it('should toggle streaming state', async () => {
      render(
        <CameraProvider>
          <TestComponent />
        </CameraProvider>
      );

      expect(screen.getByTestId('streaming-enabled')).toHaveTextContent('false');

      const toggleButton = screen.getByTestId('toggle-streaming');
      toggleButton.click();

      expect(screen.getByTestId('streaming-enabled')).toHaveTextContent('true');
    });
  });
});