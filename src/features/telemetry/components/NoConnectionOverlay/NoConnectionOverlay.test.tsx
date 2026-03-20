import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { NoConnectionOverlay } from './NoConnectionOverlay';

describe('NoConnectionOverlay', () => {
  it('renders "Connecting" message when state is connecting', () => {
    render(
      <NoConnectionOverlay robotId="robot-1" connectionState="connecting" />
    );
    expect(screen.getByText(/connecting to robot-1/i)).toBeInTheDocument();
  });

  it('renders "Not connected" message when state is disconnected', () => {
    render(
      <NoConnectionOverlay robotId="robot-1" connectionState="disconnected" />
    );
    expect(screen.getByText(/not connected/i)).toBeInTheDocument();
  });

  it('renders error message when state is error', () => {
    render(
      <NoConnectionOverlay
        robotId="robot-1"
        connectionState="error"
        errorMessage="Connection refused"
      />
    );
    expect(screen.getByText(/connection refused/i)).toBeInTheDocument();
  });

  it('truncates error message at 80 chars', () => {
    const longError = 'A'.repeat(100);
    render(
      <NoConnectionOverlay
        robotId="robot-1"
        connectionState="error"
        errorMessage={longError}
      />
    );
    const errorEl = screen.getByTestId('overlay-error-message');
    expect(errorEl.textContent.length).toBeLessThanOrEqual(83); // 80 + "..." = 83
  });

  it('renders with data-testid="no-connection-overlay"', () => {
    render(
      <NoConnectionOverlay robotId="robot-1" connectionState="disconnected" />
    );
    expect(screen.getByTestId('no-connection-overlay')).toBeInTheDocument();
  });

  it('does not capture pointer events (pointer-events-none)', () => {
    render(
      <NoConnectionOverlay robotId="robot-1" connectionState="disconnected" />
    );
    const overlay = screen.getByTestId('no-connection-overlay');
    expect(overlay.className).toMatch(/pointer-events-none/);
  });

  it('renders spinner when state is connecting', () => {
    render(
      <NoConnectionOverlay robotId="robot-1" connectionState="connecting" />
    );
    // spinner should be present — check for role or testid
    expect(screen.getByTestId('overlay-spinner')).toBeInTheDocument();
  });
});
