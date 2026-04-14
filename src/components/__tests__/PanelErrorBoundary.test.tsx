import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PanelErrorBoundary } from '../PanelErrorBoundary';

let shouldThrow = false;

function ThrowingChild() {
  if (shouldThrow) {
    throw new Error('Panel broke');
  }
  return <p>Panel content</p>;
}

describe('PanelErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = false;
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
  });

  it('renders children when no error occurs', () => {
    render(
      <PanelErrorBoundary>
        <ThrowingChild />
      </PanelErrorBoundary>,
    );
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    shouldThrow = true;
    render(
      <PanelErrorBoundary>
        <ThrowingChild />
      </PanelErrorBoundary>,
    );
    expect(screen.getByText('Panel Error')).toBeInTheDocument();
  });

  it('resets error state and re-renders children when Retry is clicked', () => {
    shouldThrow = true;

    render(
      <PanelErrorBoundary>
        <ThrowingChild />
      </PanelErrorBoundary>,
    );

    expect(screen.getByText('Panel Error')).toBeInTheDocument();

    // Fix the child so it renders successfully on retry
    shouldThrow = false;

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });
});
