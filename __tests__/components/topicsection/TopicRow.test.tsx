import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TopicRow from '@/components/topicsection/TopicRow';

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Helper to wrap TopicRow in proper table structure
const renderTopicRow = (props: any) => {
  return render(
    <table>
      <tbody>
        <TopicRow {...props} />
      </tbody>
    </table>
  );
};

describe('TopicRow', () => {
  const defaultProps = {
    topicName: '/test/topic',
    messageType: 'std_msgs/msg/String',
    connection: { rosInstance: { isConnected: true } },
    isHeavy: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock ROSLIB
    global.window.ROSLIB = {
      Topic: vi.fn().mockImplementation(() => ({
        subscribe: vi.fn((callback) => {
          // Simulate receiving a message
          setTimeout(() => callback({ data: 'test message' }), 10);
        }),
        unsubscribe: vi.fn(),
      })),
    };
  });

  it('should render topic row with basic information', () => {
    renderTopicRow(defaultProps);
    
    expect(screen.getByText('/test/topic')).toBeInTheDocument();
    expect(screen.getByText('std_msgs/msg/String')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display message data when received', async () => {
    renderTopicRow(defaultProps);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    // Check for the formatted JSON output
    const messageElement = screen.getByText((content, element) => {
      return element?.tagName === 'PRE' && content.includes('"data": "test message"');
    });
    expect(messageElement).toBeInTheDocument();
  });

  it('should show message count for live topics', async () => {
    renderTopicRow(defaultProps);
    
    await waitFor(() => {
      expect(screen.getByText('Messages: 1')).toBeInTheDocument();
    });
  });

  it('should handle heavy topics correctly', () => {
    renderTopicRow({ ...defaultProps, isHeavy: true });
    
    // Heavy topics show "No data" because they don't subscribe
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.queryByText('Messages:')).not.toBeInTheDocument();
  });

  it('should handle no connection', () => {
    renderTopicRow({ ...defaultProps, connection: null });
    
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should handle no ROS connection', () => {
    renderTopicRow({ ...defaultProps, connection: {} });
    
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should handle topic names with special characters', () => {
    renderTopicRow({ ...defaultProps, topicName: '/robot/sensors/camera_1' });
    
    expect(screen.getByText('/robot/sensors/camera_1')).toBeInTheDocument();
  });

  it('should render long topic names', () => {
    const longTopicName = '/very/long/topic/name/that/should/be/truncated';
    renderTopicRow({ ...defaultProps, topicName: longTopicName });
    
    expect(screen.getByText(longTopicName)).toBeInTheDocument();
  });
});