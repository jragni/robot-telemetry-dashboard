import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { PanelFrame } from './PanelFrame';

const defaultProps = {
  panelId: 'panel-1',
  title: 'Test Panel',
  children: <div>panel content</div>,
  onClose: vi.fn(),
  onReset: vi.fn(),
  onTabWith: vi.fn(),
  isSovereign: false,
  isClosable: true,
};

describe('PanelFrame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children inside the panel frame', () => {
    render(<PanelFrame {...defaultProps} />);
    expect(screen.getByText('panel content')).toBeInTheDocument();
  });

  it('renders the panel title in the header', () => {
    render(<PanelFrame {...defaultProps} />);
    expect(screen.getByText('Test Panel')).toBeInTheDocument();
  });

  it('renders close button when isClosable is true', () => {
    render(<PanelFrame {...defaultProps} isClosable={true} />);
    expect(
      screen.getByRole('button', { name: /close panel/i })
    ).toBeInTheDocument();
  });

  it('does not render close button when isClosable is false', () => {
    render(<PanelFrame {...defaultProps} isClosable={false} />);
    expect(
      screen.queryByRole('button', { name: /close panel/i })
    ).not.toBeInTheDocument();
  });

  it('does not render close button for sovereign panels', () => {
    render(
      <PanelFrame {...defaultProps} isSovereign={true} isClosable={true} />
    );
    expect(
      screen.queryByRole('button', { name: /close panel/i })
    ).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <PanelFrame {...defaultProps} isClosable={true} onClose={onClose} />
    );
    fireEvent.click(screen.getByRole('button', { name: /close panel/i }));
    expect(onClose).toHaveBeenCalledWith('panel-1');
  });

  it('renders a drag handle in the header', () => {
    render(<PanelFrame {...defaultProps} />);
    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });

  it('opens context menu on right-click of panel header', () => {
    render(<PanelFrame {...defaultProps} />);
    const header = screen.getByTestId('panel-header');
    fireEvent.contextMenu(header);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('context menu shows Reset to Default option', () => {
    render(<PanelFrame {...defaultProps} />);
    fireEvent.contextMenu(screen.getByTestId('panel-header'));
    expect(
      screen.getByRole('menuitem', { name: /reset to default/i })
    ).toBeInTheDocument();
  });

  it('context menu shows Remove Panel option when closable', () => {
    render(<PanelFrame {...defaultProps} isClosable={true} />);
    fireEvent.contextMenu(screen.getByTestId('panel-header'));
    expect(
      screen.getByRole('menuitem', { name: /remove panel/i })
    ).toBeInTheDocument();
  });

  it('context menu does not show Remove Panel option for sovereign panels', () => {
    render(<PanelFrame {...defaultProps} isSovereign={true} />);
    fireEvent.contextMenu(screen.getByTestId('panel-header'));
    expect(
      screen.queryByRole('menuitem', { name: /remove panel/i })
    ).not.toBeInTheDocument();
  });

  it('context menu shows Tab with option', () => {
    render(<PanelFrame {...defaultProps} />);
    fireEvent.contextMenu(screen.getByTestId('panel-header'));
    expect(
      screen.getByRole('menuitem', { name: /tab with/i })
    ).toBeInTheDocument();
  });

  it('Tab with option is disabled for sovereign panels', () => {
    render(<PanelFrame {...defaultProps} isSovereign={true} />);
    fireEvent.contextMenu(screen.getByTestId('panel-header'));
    const tabWith = screen.getByRole('menuitem', { name: /tab with/i });
    expect(tabWith).toHaveAttribute('aria-disabled', 'true');
  });

  it('clicking Reset to Default in context menu calls onReset', () => {
    const onReset = vi.fn();
    render(<PanelFrame {...defaultProps} onReset={onReset} />);
    fireEvent.contextMenu(screen.getByTestId('panel-header'));
    fireEvent.click(
      screen.getByRole('menuitem', { name: /reset to default/i })
    );
    expect(onReset).toHaveBeenCalled();
  });

  it('context menu closes when clicking outside', () => {
    render(<PanelFrame {...defaultProps} />);
    fireEvent.contextMenu(screen.getByTestId('panel-header'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
