import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PilotStatusBar } from './PilotStatusBar';
import type { PilotStatusBarProps } from '../../types/PilotPage.types';

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

  it('does not render a reconnect button (recovery action lives in PilotControls)', () => {
    render(<PilotStatusBar {...DEFAULT_PROPS} rosbridgeStatus="disconnected" />);
    expect(screen.queryByLabelText('Reconnect to robot')).not.toBeInTheDocument();
  });
});
