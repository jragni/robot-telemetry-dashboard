import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { PilotExitButton } from './PilotExitButton';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PilotExitButton', () => {
  const mockOnExit = vi.fn();

  beforeEach(() => {
    mockOnExit.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders the exit button', () => {
    render(<PilotExitButton onExit={mockOnExit} />);

    const button = screen.getByRole('button', { name: /exit pilot mode/i });
    expect(button).toBeInTheDocument();
  });

  it('renders the Exit label text', () => {
    render(<PilotExitButton onExit={mockOnExit} />);

    expect(screen.getByText('Exit')).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Click interaction
  // -------------------------------------------------------------------------

  it('calls onExit when the button is clicked', () => {
    render(<PilotExitButton onExit={mockOnExit} />);

    fireEvent.click(screen.getByRole('button', { name: /exit pilot mode/i }));

    expect(mockOnExit).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // Keyboard interaction
  // -------------------------------------------------------------------------

  it('calls onExit when the Escape key is pressed', () => {
    render(<PilotExitButton onExit={mockOnExit} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnExit).toHaveBeenCalledTimes(1);
  });

  it('does not call onExit for other key presses', () => {
    render(<PilotExitButton onExit={mockOnExit} />);

    fireEvent.keyDown(window, { key: 'Enter' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    expect(mockOnExit).not.toHaveBeenCalled();
  });

  it('removes the Escape key listener on unmount', () => {
    const { unmount } = render(<PilotExitButton onExit={mockOnExit} />);

    unmount();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(mockOnExit).not.toHaveBeenCalled();
  });
});
