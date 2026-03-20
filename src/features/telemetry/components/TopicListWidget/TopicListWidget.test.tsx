import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { TopicListWidget } from './TopicListWidget';

vi.mock('../../hooks/useTopicList', () => ({
  useTopicList: vi.fn(),
}));

vi.mock('../../hooks/useRosConnection', () => ({
  useRosConnection: vi.fn(),
}));

const defaultProps = {
  robotId: 'robot-1',
  panelId: 'panel-1',
};

const connectedResult = {
  isConnected: true,
  transport: {},
  connectionState: 'connected' as const,
};

const mockTopics = [
  { name: '/cmd_vel', type: 'geometry_msgs/Twist' },
  { name: '/imu/data', type: 'sensor_msgs/Imu' },
  { name: '/scan', type: 'sensor_msgs/LaserScan' },
];

describe('TopicListWidget', () => {
  beforeEach(async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue(connectedResult);

    const { useTopicList } = await import('../../hooks/useTopicList');
    vi.mocked(useTopicList).mockReturnValue({
      topics: mockTopics,
      isLoading: false,
      error: null,
    });
  });

  it('renders without crashing', () => {
    render(<TopicListWidget {...defaultProps} />);
  });

  it('renders topic name for each topic', () => {
    render(<TopicListWidget {...defaultProps} />);
    expect(screen.getByText('/cmd_vel')).toBeInTheDocument();
    expect(screen.getByText('/imu/data')).toBeInTheDocument();
    expect(screen.getByText('/scan')).toBeInTheDocument();
  });

  it('renders message type for each topic', () => {
    render(<TopicListWidget {...defaultProps} />);
    expect(screen.getByText('geometry_msgs/Twist')).toBeInTheDocument();
    expect(screen.getByText('sensor_msgs/Imu')).toBeInTheDocument();
    expect(screen.getByText('sensor_msgs/LaserScan')).toBeInTheDocument();
  });

  it('renders a filter/search input', () => {
    render(<TopicListWidget {...defaultProps} />);
    expect(
      screen.getByRole('textbox', { name: /filter|search/i })
    ).toBeInTheDocument();
  });

  it('filters topic list when search input changes', () => {
    render(<TopicListWidget {...defaultProps} />);
    const searchInput = screen.getByRole('textbox', { name: /filter|search/i });

    fireEvent.change(searchInput, { target: { value: 'imu' } });

    expect(screen.getByText('/imu/data')).toBeInTheDocument();
    expect(screen.queryByText('/cmd_vel')).not.toBeInTheDocument();
    expect(screen.queryByText('/scan')).not.toBeInTheDocument();
  });

  it('renders "No topics match" when filter has no results', () => {
    render(<TopicListWidget {...defaultProps} />);
    const searchInput = screen.getByRole('textbox', { name: /filter|search/i });

    fireEvent.change(searchInput, { target: { value: 'nonexistent_xyz' } });

    expect(screen.getByText(/no topics match/i)).toBeInTheDocument();
  });

  it('renders subscribe button for each topic', () => {
    render(<TopicListWidget {...defaultProps} />);
    const subscribeButtons = screen.getAllByRole('button', {
      name: /subscribe/i,
    });
    expect(subscribeButtons).toHaveLength(mockTopics.length);
  });

  it('renders NoConnectionOverlay when disconnected', async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue({
      isConnected: false,
      transport: null,
      connectionState: 'disconnected',
    });

    render(<TopicListWidget {...defaultProps} />);
    expect(screen.getByTestId('no-connection-overlay')).toBeInTheDocument();
  });

  it('renders "Fetching topics…" skeleton when loading', async () => {
    const { useTopicList } = await import('../../hooks/useTopicList');
    vi.mocked(useTopicList).mockReturnValue({
      topics: [],
      isLoading: true,
      error: null,
    });

    render(<TopicListWidget {...defaultProps} />);
    expect(screen.getByText(/fetching topics/i)).toBeInTheDocument();
  });

  it('shows JSON preview panel after subscribing to a topic', () => {
    render(<TopicListWidget {...defaultProps} />);
    const firstSubscribeBtn = screen.getAllByRole('button', {
      name: /subscribe/i,
    })[0];
    fireEvent.click(firstSubscribeBtn);
    expect(screen.getByTestId('json-preview-panel')).toBeInTheDocument();
  });

  it('renders unsubscribe button after subscribing', () => {
    render(<TopicListWidget {...defaultProps} />);
    const firstSubscribeBtn = screen.getAllByRole('button', {
      name: /subscribe/i,
    })[0];
    fireEvent.click(firstSubscribeBtn);
    expect(
      screen.getByRole('button', { name: /unsubscribe/i })
    ).toBeInTheDocument();
  });
});
