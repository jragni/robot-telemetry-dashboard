import { render, screen } from '@testing-library/react';
import { Activity, Camera } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { MobilePanelHeader } from './MobilePanelHeader';
import type { MobilePanelHeaderProps } from './RobotWorkspaceMobile.types';

const defaultProps: MobilePanelHeaderProps = {
  activeFilteredTopics: [],
  activeLabel: 'Camera',
  activePanel: 'camera',
  activeTopicName: undefined,
  icon: Camera,
  onTopicChange: vi.fn(),
  showTopicSelector: false,
};

describe('MobilePanelHeader', () => {
  it('renders the active panel label', () => {
    render(<MobilePanelHeader {...defaultProps} />);

    expect(screen.getByText('Camera')).toBeInTheDocument();
  });

  it('renders the panel icon with aria-hidden', () => {
    const { container } = render(<MobilePanelHeader {...defaultProps} />);

    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('renders a header element', () => {
    render(<MobilePanelHeader {...defaultProps} />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('does not render topic selector when showTopicSelector is false', () => {
    render(<MobilePanelHeader {...defaultProps} />);

    expect(screen.queryByLabelText('Select topic')).not.toBeInTheDocument();
  });

  it('renders without icon when icon prop is undefined', () => {
    const { container } = render(
      <MobilePanelHeader {...defaultProps} icon={undefined} />
    );

    const icons = container.querySelectorAll('[aria-hidden="true"]');
    expect(icons).toHaveLength(0);
  });

  it('renders label with correct typography classes', () => {
    render(<MobilePanelHeader {...defaultProps} activeLabel="LiDAR" />);

    const label = screen.getByText('LiDAR');
    expect(label).toHaveClass('font-mono');
    expect(label).toHaveClass('text-xs');
    expect(label).toHaveClass('uppercase');
  });

  it('renders topic selector when showTopicSelector is true and topic exists', () => {
    const topics = [{ name: '/imu/data', type: 'sensor_msgs/msg/Imu' }];
    render(
      <MobilePanelHeader
        {...defaultProps}
        activeLabel="IMU"
        activePanel="imu"
        activeFilteredTopics={topics}
        activeTopicName="/imu/data"
        icon={Activity}
        showTopicSelector={true}
      />
    );

    expect(screen.getByLabelText('Select topic')).toBeInTheDocument();
  });
});
