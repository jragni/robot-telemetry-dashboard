import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DataCard } from './DataCard';

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('DataCard', () => {
  // -------------------------------------------------------------------------
  // Title rendering
  // -------------------------------------------------------------------------

  describe('title', () => {
    it('renders the title text in the header', () => {
      render(<DataCard title="SENSOR DATA">content</DataCard>);
      expect(screen.getByText('SENSOR DATA')).toBeInTheDocument();
    });

    it('applies monospace uppercase tracking styles to the title', () => {
      render(<DataCard title="SENSOR DATA">content</DataCard>);
      const title = screen.getByText('SENSOR DATA');
      expect(title).toHaveClass('font-mono');
      expect(title).toHaveClass('uppercase');
    });
  });

  // -------------------------------------------------------------------------
  // Children
  // -------------------------------------------------------------------------

  describe('children', () => {
    it('renders children in the body', () => {
      render(<DataCard title="PANEL">child content</DataCard>);
      expect(screen.getByText('child content')).toBeInTheDocument();
    });

    it('renders complex children', () => {
      render(
        <DataCard title="PANEL">
          <span data-testid="nested-child">nested</span>
        </DataCard>
      );
      expect(screen.getByTestId('nested-child')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Status prop
  // -------------------------------------------------------------------------

  describe('status prop', () => {
    it('shows StatusIndicator when status prop is provided', () => {
      const { container } = render(
        <DataCard title="PANEL" status="connected">
          content
        </DataCard>
      );
      expect(
        container.querySelector('span[data-slot="status-dot"]')
      ).toBeInTheDocument();
    });

    it('does not show StatusIndicator when status prop is omitted', () => {
      const { container } = render(<DataCard title="PANEL">content</DataCard>);
      expect(
        container.querySelector('span[data-slot="status-dot"]')
      ).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // headerActions prop
  // -------------------------------------------------------------------------

  describe('headerActions prop', () => {
    it('renders headerActions in the header when provided', () => {
      render(
        <DataCard
          title="PANEL"
          headerActions={<button data-testid="hdr-btn">Action</button>}
        >
          content
        </DataCard>
      );
      expect(screen.getByTestId('hdr-btn')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // className prop
  // -------------------------------------------------------------------------

  describe('className prop', () => {
    it('applies custom className to the wrapper element', () => {
      const { container } = render(
        <DataCard title="PANEL" className="custom-card-class">
          content
        </DataCard>
      );
      expect(container.firstElementChild).toHaveClass('custom-card-class');
    });
  });
});
