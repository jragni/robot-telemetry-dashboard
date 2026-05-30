import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PilotCompass } from '../PilotCompass';

describe('PilotCompass', () => {
  it('renders a known heading as a degree readout and labelled strip', () => {
    render(<PilotCompass heading={90} />);

    expect(screen.getByText('90°')).toBeInTheDocument();
    expect(screen.getByLabelText('Heading: 90 degrees')).toBeInTheDocument();
  });

  it('normalizes the readout into 0-360', () => {
    render(<PilotCompass heading={450} />);

    expect(screen.getByText('90°')).toBeInTheDocument();
  });

  it('surfaces a loss-of-fix state when heading is null (no confident North)', () => {
    render(<PilotCompass heading={null} />);

    // The exact T-165 regression: a null heading must NOT render a confident 0 degrees.
    expect(screen.queryByText('0°')).not.toBeInTheDocument();
    expect(screen.getByText('---°')).toBeInTheDocument();

    const strip = screen.getByLabelText('Heading unknown — no orientation data');
    expect(strip).toHaveClass('opacity-40');
  });
});
