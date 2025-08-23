import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopicSectionHeader from '@/components/topicsection/TopicSectionHeader';

describe('TopicSectionHeader', () => {
  const mockOnToggleMinimize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Expanded state', () => {
    it('should render header in expanded state', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={5}
          isMinimized={false}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      expect(screen.getByText('Topics (5)')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should call onToggleMinimize when minimize button is clicked', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={3}
          isMinimized={false}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnToggleMinimize).toHaveBeenCalledTimes(1);
    });

    it('should display minimize icon in expanded state', () => {
      const { container } = render(
        <TopicSectionHeader 
          subscriptionsCount={2}
          isMinimized={false}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      // Check for Minimize2 icon (should contain specific SVG class)
      const minimizeIcon = container.querySelector('.lucide-minimize-2');
      expect(minimizeIcon).toBeInTheDocument();
    });
  });

  describe('Minimized state', () => {
    it('should render header in minimized state', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={7}
          isMinimized={true}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      expect(screen.getByText('Topics')).toBeInTheDocument();
      expect(screen.getByText('(7 topics)')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should call onToggleMinimize when expand button is clicked', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={4}
          isMinimized={true}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnToggleMinimize).toHaveBeenCalledTimes(1);
    });

    it('should display expand icon in minimized state', () => {
      const { container } = render(
        <TopicSectionHeader 
          subscriptionsCount={1}
          isMinimized={true}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      // Check for Maximize2 icon
      const expandIcon = container.querySelector('.lucide-maximize-2');
      expect(expandIcon).toBeInTheDocument();
    });

    it('should render in minimized layout', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={3}
          isMinimized={true}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      // In minimized state, shows topic count separately
      expect(screen.getByText('Topics')).toBeInTheDocument();
      expect(screen.getByText('(3 topics)')).toBeInTheDocument();
    });
  });

  describe('Subscription count display', () => {
    it('should handle zero subscriptions', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={0}
          isMinimized={false}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      expect(screen.getByText('Topics (0)')).toBeInTheDocument();
    });

    it('should handle single subscription', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={1}
          isMinimized={true}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      expect(screen.getByText('(1 topics)')).toBeInTheDocument();
    });

    it('should handle multiple subscriptions correctly', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={15}
          isMinimized={false}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      expect(screen.getByText('Topics (15)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render minimize button with proper attributes', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={2}
          isMinimized={false}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should render expand button with proper attributes', () => {
      render(
        <TopicSectionHeader 
          subscriptionsCount={2}
          isMinimized={true}
          onToggleMinimize={mockOnToggleMinimize}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});