import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createControlStore } from '../../stores/controlStore';

import { TopicSelector } from './TopicSelector';

import type { TopicInfo } from '@/shared/types/ros-messages.types';

describe('TopicSelector', () => {
  let store: ReturnType<typeof createControlStore>;

  const twistTopics: TopicInfo[] = [
    { name: '/cmd_vel', type: 'geometry_msgs/Twist' },
    { name: '/robot/cmd_vel', type: 'geometry_msgs/Twist' },
  ];

  const mixedTopics: TopicInfo[] = [
    { name: '/cmd_vel', type: 'geometry_msgs/Twist' },
    { name: '/imu/data', type: 'sensor_msgs/Imu' },
    { name: '/scan', type: 'sensor_msgs/LaserScan' },
    { name: '/robot/cmd_vel', type: 'geometry_msgs/Twist' },
  ];

  beforeEach(() => {
    store = createControlStore('robot-1');
  });

  it('renders a select/combobox element', () => {
    render(
      <TopicSelector controlStore={store} availableTopics={twistTopics} />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('only shows geometry_msgs/Twist topics', () => {
    render(
      <TopicSelector controlStore={store} availableTopics={mixedTopics} />
    );
    // Should show /cmd_vel and /robot/cmd_vel but not imu or scan
    expect(screen.getByText('/cmd_vel')).toBeInTheDocument();
    expect(screen.getByText('/robot/cmd_vel')).toBeInTheDocument();
    expect(screen.queryByText('/imu/data')).not.toBeInTheDocument();
    expect(screen.queryByText('/scan')).not.toBeInTheDocument();
  });

  it('defaults to /cmd_vel when present', () => {
    render(
      <TopicSelector controlStore={store} availableTopics={twistTopics} />
    );
    expect(store.getState().selectedTopic).toBe('/cmd_vel');
  });

  it('defaults to first twist topic when /cmd_vel is absent', () => {
    const noDefaultTopics: TopicInfo[] = [
      { name: '/robot/cmd_vel', type: 'geometry_msgs/Twist' },
    ];
    render(
      <TopicSelector controlStore={store} availableTopics={noDefaultTopics} />
    );
    expect(store.getState().selectedTopic).toBe('/robot/cmd_vel');
  });

  it('shows "No cmd_vel topics available" when list is empty', () => {
    render(<TopicSelector controlStore={store} availableTopics={[]} />);
    expect(screen.getByText(/no cmd_vel topics/i)).toBeInTheDocument();
  });

  it('combobox is disabled when no twist topics available', () => {
    render(<TopicSelector controlStore={store} availableTopics={[]} />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('is disabled when e-stop is active', () => {
    store.getState().activateEStop();
    render(
      <TopicSelector controlStore={store} availableTopics={twistTopics} />
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('selecting a topic updates the store', () => {
    render(
      <TopicSelector controlStore={store} availableTopics={twistTopics} />
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '/robot/cmd_vel' } });
    expect(store.getState().selectedTopic).toBe('/robot/cmd_vel');
  });

  it('only shows Twist topics (filters non-Twist from mixed list)', () => {
    render(
      <TopicSelector controlStore={store} availableTopics={mixedTopics} />
    );
    const options = screen.getAllByRole('option');
    const optionTexts = options.map((o) => o.textContent);
    expect(optionTexts).toContain('/cmd_vel');
    expect(optionTexts).toContain('/robot/cmd_vel');
    expect(
      optionTexts.every((t) => !t?.includes('/imu') && !t?.includes('/scan'))
    ).toBe(true);
  });
});
