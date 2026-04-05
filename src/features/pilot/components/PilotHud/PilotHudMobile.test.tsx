import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { PilotHudMobile } from './PilotHudMobile';
import type { PilotHudMobileProps } from '../../types/PilotView.types';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const DEFAULT_PROPS: PilotHudMobileProps = {
  angularVelocity: 0.5,
  connected: true,
  linearVelocity: 0.3,
  onAngularVelocityChange: vi.fn(),
  onDirectionEnd: vi.fn(),
  onDirectionStart: vi.fn(),
  onEmergencyStop: vi.fn(),
  onLinearVelocityChange: vi.fn(),
  rosbridgeStatus: 'connected',
  telemetry: {
    battery: { percentage: 80, voltage: 12.4 },
    imu: { pitch: 0, roll: 0, yaw: 90 },
    lidarPoints: [],
    lidarRangeMax: 12,
    linearSpeed: 0,
    uptimeSeconds: 120,
  },
  videoStatus: 'idle',
};

describe('PilotHudMobile', () => {
  it('renders the HUD overlay with correct aria-label', () => {
    render(<PilotHudMobile {...DEFAULT_PROPS} />);
    expect(screen.getByLabelText('Pilot HUD overlay — mobile')).toBeInTheDocument();
  });

  it('applies select-none class to prevent text selection', () => {
    render(<PilotHudMobile {...DEFAULT_PROPS} />);
    const hud = screen.getByLabelText('Pilot HUD overlay — mobile');
    expect(hud).toHaveClass('select-none');
  });

  it('sets touch-action: manipulation to suppress long-press gestures', () => {
    render(<PilotHudMobile {...DEFAULT_PROPS} />);
    const hud = screen.getByLabelText('Pilot HUD overlay — mobile');
    expect(hud).toHaveStyle({ touchAction: 'manipulation' });
  });

  it('prevents default on contextmenu event', () => {
    render(<PilotHudMobile {...DEFAULT_PROPS} />);
    const hud = screen.getByLabelText('Pilot HUD overlay — mobile');
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    fireEvent(hud, event);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});
