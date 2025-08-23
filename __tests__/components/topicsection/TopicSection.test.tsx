import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TopicSection from '@/components/topicsection';
import { useConnection } from '@/components/dashboard/ConnectionProvider';

vi.mock('@/components/dashboard/ConnectionProvider', () => ({
  useConnection: vi.fn(),
}));

describe('TopicSection', () => {
  const mockConnection = {
    url: 'ws://localhost:9090',
    status: 'connected',
    ros: { isConnected: true },
    subscriptions: [
      { topicName: '/cmd_vel', messageType: 'geometry_msgs/msg/Twist' },
      { topicName: '/odom', messageType: 'nav_msgs/msg/Odometry' },
      { topicName: '/camera/image', messageType: 'sensor_msgs/msg/Image' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.window.ROSLIB = {
      Topic: vi.fn().mockImplementation(() => ({
        subscribe: vi.fn(),
        unsubscribe: vi.fn(),
      })),
    };
  });

  it('should render with correct topics count in title', () => {
    (useConnection as any).mockReturnValue({
      selectedConnection: mockConnection,
    });

    render(<TopicSection />);
    
    expect(screen.getByText('Topics (3)')).toBeInTheDocument();
    
    // Table should be visible immediately (no expand/collapse)
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Topic')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
  });

  it('should handle no subscriptions', () => {
    (useConnection as any).mockReturnValue({
      selectedConnection: { ...mockConnection, subscriptions: [] },
    });

    render(<TopicSection />);
    
    expect(screen.getByText('Topics (0)')).toBeInTheDocument();
    expect(screen.getByText('No topics available')).toBeInTheDocument();
  });

  it('should render table immediately without expand/collapse', () => {
    (useConnection as any).mockReturnValue({
      selectedConnection: mockConnection,
    });

    render(<TopicSection />);
    
    // Table should be immediately visible (no expand/collapse feature)
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // All topics should be visible
    expect(screen.getByText('/cmd_vel')).toBeInTheDocument();
    expect(screen.getByText('/odom')).toBeInTheDocument();
    expect(screen.getByText('/camera/image')).toBeInTheDocument();
  });

  it('should display topic data in table rows', () => {
    (useConnection as any).mockReturnValue({
      selectedConnection: mockConnection,
    });

    render(<TopicSection />);
    
    // Check that topic names are displayed  
    expect(screen.getByText('/cmd_vel')).toBeInTheDocument();
    expect(screen.getByText('/odom')).toBeInTheDocument();
    expect(screen.getByText('/camera/image')).toBeInTheDocument();
    
    // Check that message types are displayed
    expect(screen.getByText('geometry_msgs/msg/Twist')).toBeInTheDocument();
    expect(screen.getByText('nav_msgs/msg/Odometry')).toBeInTheDocument();
  });
});