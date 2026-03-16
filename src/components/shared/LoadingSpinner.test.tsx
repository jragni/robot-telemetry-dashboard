import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { LoadingSpinner } from './LoadingSpinner';

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('LoadingSpinner', () => {
  // -------------------------------------------------------------------------
  // SVG rendering
  // -------------------------------------------------------------------------

  describe('SVG element', () => {
    it('renders an SVG element', () => {
      const { container } = render(<LoadingSpinner />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Size variants
  // -------------------------------------------------------------------------

  describe('size variants', () => {
    it('applies sm size classes (w-4 h-4) when size="sm"', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4');
      expect(svg).toHaveClass('h-4');
    });

    it('applies md size classes (w-6 h-6) by default', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-6');
      expect(svg).toHaveClass('h-6');
    });

    it('applies md size classes (w-6 h-6) when size="md"', () => {
      const { container } = render(<LoadingSpinner size="md" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-6');
      expect(svg).toHaveClass('h-6');
    });

    it('applies lg size classes (w-8 h-8) when size="lg"', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-8');
      expect(svg).toHaveClass('h-8');
    });
  });

  // -------------------------------------------------------------------------
  // Spin animation
  // -------------------------------------------------------------------------

  describe('animation', () => {
    it('has animate-spin-slow class applied', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('animate-spin-slow');
    });
  });

  // -------------------------------------------------------------------------
  // className prop
  // -------------------------------------------------------------------------

  describe('className prop', () => {
    it('accepts and applies a custom className to the SVG element', () => {
      const { container } = render(
        <LoadingSpinner className="text-status-nominal" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-status-nominal');
    });
  });
});
