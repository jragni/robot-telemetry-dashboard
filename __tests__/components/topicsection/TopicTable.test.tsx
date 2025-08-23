import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TopicTable from '@/components/topicsection/TopicTable';

// Mock TopicRow component
vi.mock('@/components/topicsection/TopicRow', () => ({
  default: ({ topicName, messageType }: { topicName: string; messageType: string }) => (
    <tr data-testid={`topic-row-${topicName}`}>
      <td>{topicName}</td>
      <td>{messageType}</td>
      <td>Mock data</td>
    </tr>
  ),
}));

describe('TopicTable', () => {
  const mockSubscriptions = [
    { topicName: '/cmd_vel', messageType: 'geometry_msgs/msg/Twist' },
    { topicName: '/odom', messageType: 'nav_msgs/msg/Odometry' },
    { topicName: '/camera/image', messageType: 'sensor_msgs/msg/Image' },
  ];

  const mockConnection = { ros: { isConnected: true } };
  const mockIsHeavyTopic = vi.fn((messageType: string) => 
    messageType.includes('Image') || messageType.includes('PointCloud')
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render table with correct headers', () => {
    render(
      <TopicTable 
        subscriptions={mockSubscriptions}
        selectedConnection={mockConnection}
        isHeavyTopic={mockIsHeavyTopic}
      />
    );

    expect(screen.getByText('Topic')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
  });

  it('should render all subscription rows', () => {
    render(
      <TopicTable 
        subscriptions={mockSubscriptions}
        selectedConnection={mockConnection}
        isHeavyTopic={mockIsHeavyTopic}
      />
    );

    expect(screen.getByText('/cmd_vel')).toBeInTheDocument();
    expect(screen.getByText('/odom')).toBeInTheDocument();
    expect(screen.getByText('/camera/image')).toBeInTheDocument();
  });

  it('should apply mobile scrolling styles', () => {
    const { container } = render(
      <TopicTable 
        subscriptions={mockSubscriptions}
        selectedConnection={mockConnection}
        isHeavyTopic={mockIsHeavyTopic}
      />
    );

    const scrollContainer = container.firstElementChild as HTMLElement;
    expect(scrollContainer).toHaveStyle({
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      WebkitOverflowScrolling: 'touch',
      paddingLeft: '1rem',
      paddingRight: '1rem',
    });
  });

  it('should handle empty subscriptions list', () => {
    render(
      <TopicTable 
        subscriptions={[]}
        selectedConnection={mockConnection}
        isHeavyTopic={mockIsHeavyTopic}
      />
    );

    // Should still render headers
    expect(screen.getByText('Topic')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();

    // No topic rows should be present
    expect(screen.queryByTestId(/topic-row-/)).not.toBeInTheDocument();
  });

  it('should pass correct props to TopicRow components', () => {
    render(
      <TopicTable 
        subscriptions={mockSubscriptions}
        selectedConnection={mockConnection}
        isHeavyTopic={mockIsHeavyTopic}
      />
    );

    // Check that isHeavyTopic function is called correctly
    expect(mockIsHeavyTopic).toHaveBeenCalledWith('geometry_msgs/msg/Twist');
    expect(mockIsHeavyTopic).toHaveBeenCalledWith('nav_msgs/msg/Odometry');
    expect(mockIsHeavyTopic).toHaveBeenCalledWith('sensor_msgs/msg/Image');
  });

  it('should apply proper table structure', () => {
    const { container } = render(
      <TopicTable 
        subscriptions={mockSubscriptions}
        selectedConnection={mockConnection}
        isHeavyTopic={mockIsHeavyTopic}
      />
    );

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    
    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
    
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
  });

  it('should render Data column header', () => {
    render(
      <TopicTable 
        subscriptions={mockSubscriptions}
        selectedConnection={mockConnection}
        isHeavyTopic={mockIsHeavyTopic}
      />
    );

    const dataHeader = screen.getByText('Data');
    expect(dataHeader).toBeInTheDocument();
  });
});