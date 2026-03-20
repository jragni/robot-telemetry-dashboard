import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';

import { createControlStore } from '../../stores/controlStore';

import { VelocitySliders } from './VelocitySliders';

describe('VelocitySliders', () => {
  let store: ReturnType<typeof createControlStore>;

  beforeEach(() => {
    store = createControlStore('robot-1');
  });

  it('renders linear velocity slider', () => {
    render(<VelocitySliders controlStore={store} />);
    expect(screen.getByRole('slider', { name: /linear/i })).toBeInTheDocument();
  });

  it('renders angular velocity slider', () => {
    render(<VelocitySliders controlStore={store} />);
    expect(
      screen.getByRole('slider', { name: /angular/i })
    ).toBeInTheDocument();
  });

  it('shows current linear velocity value', () => {
    render(<VelocitySliders controlStore={store} />);
    // Both sliders default to 0.5, so at least one label shows it
    const labels = screen.getAllByText('0.5');
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('linear slider has min=0.1 attribute', () => {
    render(<VelocitySliders controlStore={store} />);
    const linearSlider = screen.getByRole('slider', { name: /linear/i });
    expect(linearSlider).toHaveAttribute('aria-valuemin', '0.1');
  });

  it('linear slider has max=2.0 attribute', () => {
    render(<VelocitySliders controlStore={store} />);
    const linearSlider = screen.getByRole('slider', { name: /linear/i });
    expect(linearSlider).toHaveAttribute('aria-valuemax', '2');
  });

  it('angular slider has min=0.1 attribute', () => {
    render(<VelocitySliders controlStore={store} />);
    const angularSlider = screen.getByRole('slider', { name: /angular/i });
    expect(angularSlider).toHaveAttribute('aria-valuemin', '0.1');
  });

  it('angular slider has max=2.0 attribute', () => {
    render(<VelocitySliders controlStore={store} />);
    const angularSlider = screen.getByRole('slider', { name: /angular/i });
    expect(angularSlider).toHaveAttribute('aria-valuemax', '2');
  });

  it('both sliders are disabled when e-stop is active', () => {
    store.getState().activateEStop();
    render(<VelocitySliders controlStore={store} />);
    const sliders = screen.getAllByRole('slider');
    sliders.forEach((slider) => {
      expect(slider).toHaveAttribute('aria-disabled', 'true');
    });
  });

  it('linear slider default value is 0.5', () => {
    render(<VelocitySliders controlStore={store} />);
    const linearSlider = screen.getByRole('slider', { name: /linear/i });
    expect(linearSlider).toHaveAttribute('aria-valuenow', '0.5');
  });

  it('angular slider default value is 0.5', () => {
    render(<VelocitySliders controlStore={store} />);
    const angularSlider = screen.getByRole('slider', { name: /angular/i });
    expect(angularSlider).toHaveAttribute('aria-valuenow', '0.5');
  });
});
