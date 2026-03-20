import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { InstrumentHudOverlay } from './InstrumentHudOverlay';

vi.mock('../../../../../telemetry/hooks/useRosConnection', () => ({
  useRosConnection: vi.fn(),
}));

const connectedResult = {
  isConnected: true,
  transport: {},
  connectionState: 'connected' as const,
};

const defaultProps = {
  robotId: 'robot-1',
};

describe('InstrumentHudOverlay', () => {
  beforeEach(async () => {
    const { useRosConnection } = await import(
      '../../../../../telemetry/hooks/useRosConnection'
    );
    vi.mocked(useRosConnection).mockReturnValue(connectedResult);
  });

  it('renders without crashing', () => {
    render(<InstrumentHudOverlay {...defaultProps} />);
  });

  it('renders with data-testid="instrument-hud-overlay"', () => {
    render(<InstrumentHudOverlay {...defaultProps} />);
    expect(screen.getByTestId('instrument-hud-overlay')).toBeInTheDocument();
  });

  it('is positioned at the right edge of the video panel', () => {
    render(<InstrumentHudOverlay {...defaultProps} />);
    const overlay = screen.getByTestId('instrument-hud-overlay');
    expect(overlay).toHaveAttribute('data-position', 'right');
  });

  it('renders heading label', () => {
    render(<InstrumentHudOverlay {...defaultProps} />);
    expect(screen.getByText(/heading/i)).toBeInTheDocument();
  });

  it('renders velocity label', () => {
    render(<InstrumentHudOverlay {...defaultProps} />);
    expect(screen.getByText(/vel/i)).toBeInTheDocument();
  });

  it('renders battery label', () => {
    render(<InstrumentHudOverlay {...defaultProps} />);
    expect(screen.getByText(/batt/i)).toBeInTheDocument();
  });

  it('shows dashes when no data is available', () => {
    render(<InstrumentHudOverlay {...defaultProps} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });
});
