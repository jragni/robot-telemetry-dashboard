import { describe, expect, it, beforeAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PilotCompassMobile } from '../PilotCompassMobile';

beforeAll(() => {
  // jsdom has no ResizeObserver; PilotCompassMobile measures its container with one.
  class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  }
  globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

describe('PilotCompassMobile', () => {
  it('labels the strip with a known heading', () => {
    render(<PilotCompassMobile heading={90} />);

    expect(screen.getByLabelText('Heading: 90 degrees')).toBeInTheDocument();
  });

  it('surfaces a loss-of-fix state when heading is null', () => {
    render(<PilotCompassMobile heading={null} />);

    const strip = screen.getByLabelText('Heading unknown — no orientation data');
    expect(strip).toBeInTheDocument();
    expect(strip.querySelector('canvas')).toHaveClass('opacity-40');
  });
});
