import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createControlStore } from '../../stores/controlStore';

import { ControlPad } from './ControlPad';

describe('ControlPad', () => {
  let store: ReturnType<typeof createControlStore>;

  beforeEach(() => {
    store = createControlStore('robot-1');
  });

  it('renders all five direction buttons', () => {
    render(<ControlPad controlStore={store} />);
    expect(
      screen.getByRole('button', { name: /forward/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /backward/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /left/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /right/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('pressing forward sets direction to forward in store', () => {
    render(<ControlPad controlStore={store} />);
    const fwdBtn = screen.getByRole('button', { name: /forward/i });
    fireEvent.mouseDown(fwdBtn);
    expect(store.getState().activeDirection).toBe('forward');
  });

  it('pressing backward sets direction to backward in store', () => {
    render(<ControlPad controlStore={store} />);
    fireEvent.mouseDown(screen.getByRole('button', { name: /backward/i }));
    expect(store.getState().activeDirection).toBe('backward');
  });

  it('pressing left sets direction to left in store', () => {
    render(<ControlPad controlStore={store} />);
    fireEvent.mouseDown(screen.getByRole('button', { name: /left/i }));
    expect(store.getState().activeDirection).toBe('left');
  });

  it('pressing right sets direction to right in store', () => {
    render(<ControlPad controlStore={store} />);
    fireEvent.mouseDown(screen.getByRole('button', { name: /right/i }));
    expect(store.getState().activeDirection).toBe('right');
  });

  it('releasing a direction button clears activeDirection', () => {
    render(<ControlPad controlStore={store} />);
    const fwdBtn = screen.getByRole('button', { name: /forward/i });
    fireEvent.mouseDown(fwdBtn);
    fireEvent.mouseUp(fwdBtn);
    expect(store.getState().activeDirection).toBeNull();
  });

  it('pressing stop button sets direction to stop', () => {
    render(<ControlPad controlStore={store} />);
    fireEvent.mouseDown(screen.getByRole('button', { name: /stop/i }));
    // Stop publishes zeroTwist and clears direction
    expect(store.getState().activeDirection).toBe('stop');
  });

  it('shows visual active state on pressed direction button', () => {
    render(<ControlPad controlStore={store} />);
    const fwdBtn = screen.getByRole('button', { name: /forward/i });
    fireEvent.mouseDown(fwdBtn);
    expect(fwdBtn).toHaveAttribute('data-active', 'true');
  });

  it('all direction buttons are disabled when e-stop is active', () => {
    store.getState().activateEStop();
    render(<ControlPad controlStore={store} />);
    expect(screen.getByRole('button', { name: /forward/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /backward/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /left/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /right/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /stop/i })).toBeDisabled();
  });

  it('button press is ignored when e-stop is active', () => {
    store.getState().activateEStop();
    render(<ControlPad controlStore={store} />);
    fireEvent.mouseDown(screen.getByRole('button', { name: /forward/i }));
    expect(store.getState().activeDirection).toBeNull();
  });

  it('touch start sets direction', () => {
    render(<ControlPad controlStore={store} />);
    const fwdBtn = screen.getByRole('button', { name: /forward/i });
    fireEvent.touchStart(fwdBtn);
    expect(store.getState().activeDirection).toBe('forward');
  });

  it('touch end clears direction', () => {
    render(<ControlPad controlStore={store} />);
    const fwdBtn = screen.getByRole('button', { name: /forward/i });
    fireEvent.touchStart(fwdBtn);
    fireEvent.touchEnd(fwdBtn);
    expect(store.getState().activeDirection).toBeNull();
  });
});
