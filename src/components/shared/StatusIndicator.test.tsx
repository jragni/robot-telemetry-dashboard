import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { StatusIndicator } from './StatusIndicator';

import type { ConnectionState } from '@/types';

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('StatusIndicator', () => {
  // -------------------------------------------------------------------------
  // Dot rendering for every ConnectionState
  // -------------------------------------------------------------------------

  describe('dot rendering', () => {
    const states: ConnectionState[] = [
      'connected',
      'connecting',
      'disconnected',
      'error',
    ];

    it.each(states)('renders a dot element for state "%s"', (state) => {
      const { container } = render(<StatusIndicator state={state} />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // State → class mapping
  // -------------------------------------------------------------------------

  describe('state class mapping', () => {
    it('applies bg-status-nominal class for "connected" state', () => {
      const { container } = render(<StatusIndicator state="connected" />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).toHaveClass('bg-status-nominal');
    });

    it('does not apply pulse animation for "connected" state', () => {
      const { container } = render(<StatusIndicator state="connected" />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).not.toHaveClass('animate-status-pulse-fast');
    });

    it('applies bg-status-degraded class for "connecting" state', () => {
      const { container } = render(<StatusIndicator state="connecting" />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).toHaveClass('bg-status-degraded');
    });

    it('applies pulse animation for "connecting" state', () => {
      const { container } = render(<StatusIndicator state="connecting" />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).toHaveClass('animate-status-pulse-fast');
    });

    it('applies bg-status-offline class for "disconnected" state', () => {
      const { container } = render(<StatusIndicator state="disconnected" />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).toHaveClass('bg-status-offline');
    });

    it('does not apply animation for "disconnected" state', () => {
      const { container } = render(<StatusIndicator state="disconnected" />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).not.toHaveClass('animate-status-pulse-fast');
    });

    it('applies bg-status-critical class for "error" state', () => {
      const { container } = render(<StatusIndicator state="error" />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).toHaveClass('bg-status-critical');
    });

    it('does not apply animation for "error" state', () => {
      const { container } = render(<StatusIndicator state="error" />);
      const dot = container.querySelector('span[data-slot="status-dot"]');
      expect(dot).not.toHaveClass('animate-status-pulse-fast');
    });
  });

  // -------------------------------------------------------------------------
  // Label prop
  // -------------------------------------------------------------------------

  describe('label prop', () => {
    it('renders label text when label prop is provided', () => {
      render(<StatusIndicator state="connected" label="ONLINE" />);
      expect(screen.getByText('ONLINE')).toBeInTheDocument();
    });

    it('does not render label element when label prop is omitted', () => {
      const { container } = render(<StatusIndicator state="connected" />);
      expect(
        container.querySelector('span[data-slot="status-label"]')
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // className prop
  // -------------------------------------------------------------------------

  describe('className prop', () => {
    it('accepts and applies a custom className to the wrapper', () => {
      const { container } = render(
        <StatusIndicator state="connected" className="my-custom-class" />
      );
      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass('my-custom-class');
    });
  });
});
