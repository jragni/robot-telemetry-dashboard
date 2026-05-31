import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GyroInline } from '../GyroInline';

describe('GyroInline', () => {
  it('renders R P Y labels', () => {
    render(<GyroInline orientation={{ pitch: 0, roll: 0, yaw: 0 }} />);
    const container = screen.getByLabelText('Gyro readout');
    expect(container).toBeInTheDocument();
    expect(container.textContent).toContain('R:');
    expect(container.textContent).toContain('P:');
    expect(container.textContent).toContain('Y:');
  });

  it('formats degree values when provided', () => {
    render(<GyroInline orientation={{ pitch: 45.5, roll: -10.2, yaw: 180 }} />);
    const container = screen.getByLabelText('Gyro readout');
    expect(container.textContent).toContain('-10.2');
    expect(container.textContent).toContain('45.5');
    expect(container.textContent).toContain('180');
  });

  it('shows dashes for all axes when orientation is null (unknown)', () => {
    render(<GyroInline orientation={null} />);
    const container = screen.getByLabelText('Gyro readout');
    const text = container.textContent;
    const dashCount = (text.match(/---/g) ?? []).length;
    expect(dashCount).toBe(3);
  });
});
