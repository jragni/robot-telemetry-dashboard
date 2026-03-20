import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { createControlStore } from '../../stores/controlStore';

import { EStop } from './EStop';

describe('EStop', () => {
  let store: ReturnType<typeof createControlStore>;
  let onActivate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    store = createControlStore('robot-1');
    onActivate = vi.fn();
  });

  it('renders the E-Stop button', () => {
    render(<EStop controlStore={store} onActivate={onActivate} />);
    expect(screen.getByRole('button', { name: /e-stop/i })).toBeInTheDocument();
  });

  it('E-Stop button is never disabled', () => {
    store.getState().activateEStop();
    render(<EStop controlStore={store} onActivate={onActivate} />);
    expect(screen.getByRole('button', { name: /e-stop/i })).not.toBeDisabled();
  });

  it('clicking activates e-stop in store', () => {
    render(<EStop controlStore={store} onActivate={onActivate} />);
    fireEvent.click(screen.getByRole('button', { name: /e-stop/i }));
    expect(store.getState().eStopActive).toBe(true);
  });

  it('clicking when active releases e-stop', () => {
    store.getState().activateEStop();
    render(<EStop controlStore={store} onActivate={onActivate} />);
    fireEvent.click(screen.getByRole('button', { name: /e-stop/i }));
    expect(store.getState().eStopActive).toBe(false);
  });

  it('calls onActivate callback when e-stop is activated', () => {
    render(<EStop controlStore={store} onActivate={onActivate} />);
    fireEvent.click(screen.getByRole('button', { name: /e-stop/i }));
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it('shows "E-STOP ACTIVE" banner when active', () => {
    store.getState().activateEStop();
    render(<EStop controlStore={store} onActivate={onActivate} />);
    expect(screen.getByText(/e-stop active/i)).toBeInTheDocument();
  });

  it('does not show "E-STOP ACTIVE" banner when inactive', () => {
    render(<EStop controlStore={store} onActivate={onActivate} />);
    expect(screen.queryByText(/e-stop active/i)).not.toBeInTheDocument();
  });

  it('button has pulsing animation class when active', () => {
    store.getState().activateEStop();
    render(<EStop controlStore={store} onActivate={onActivate} />);
    const btn = screen.getByRole('button', { name: /e-stop/i });
    expect(btn.className).toMatch(/animate-pulse/);
  });
});
