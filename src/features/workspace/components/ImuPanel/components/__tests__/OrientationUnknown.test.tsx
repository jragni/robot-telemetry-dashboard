import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { OrientationUnknown } from '../OrientationUnknown';

describe('OrientationUnknown', () => {
  it('renders the loss-of-fix title and explanation as a status', () => {
    render(<OrientationUnknown />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(screen.getByText('Orientation unknown')).toBeInTheDocument();
    expect(screen.getByText('IMU is not reporting orientation data')).toBeInTheDocument();
  });
});
