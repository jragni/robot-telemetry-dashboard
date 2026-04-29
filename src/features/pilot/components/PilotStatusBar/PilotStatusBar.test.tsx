import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PilotStatusBarProps } from '../../types/PilotPage.types';
import { PilotStatusBar } from './PilotStatusBar';

const DEFAULT_PROPS: PilotStatusBarProps = {
  battery: { percentage: 80, voltage: 12.4 },
  rosbridgeStatus: 'connected',
  videoStatus: 'streaming',
};

describe('PilotStatusBar', () => {
  it('renders system status section', () => {
    render(<PilotStatusBar {...DEFAULT_PROPS} />);
    expect(screen.getByLabelText('System status')).toBeInTheDocument();
  });

  it('does not show reconnect button when connected', () => {
    const onReconnect = vi.fn();
    render(<PilotStatusBar {...DEFAULT_PROPS} onReconnect={onReconnect} />);
    expect(screen.queryByLabelText('Reconnect to robot')).not.toBeInTheDocument();
  });

  it('does not show reconnect button when disconnected but no handler provided', () => {
    render(<PilotStatusBar {...DEFAULT_PROPS} rosbridgeStatus="disconnected" />);
    expect(screen.queryByLabelText('Reconnect to robot')).not.toBeInTheDocument();
  });

  it('shows reconnect button when disconnected and handler provided', () => {
    const onReconnect = vi.fn();
    render(
      <PilotStatusBar
        {...DEFAULT_PROPS}
        onReconnect={onReconnect}
        rosbridgeStatus="disconnected"
      />,
    );
    expect(screen.getByLabelText('Reconnect to robot')).toBeInTheDocument();
  });

  it('calls onReconnect when reconnect button is clicked', () => {
    const onReconnect = vi.fn();
    render(
      <PilotStatusBar
        {...DEFAULT_PROPS}
        onReconnect={onReconnect}
        rosbridgeStatus="disconnected"
      />,
    );
    fireEvent.click(screen.getByLabelText('Reconnect to robot'));
    expect(onReconnect).toHaveBeenCalledOnce();
  });
});
