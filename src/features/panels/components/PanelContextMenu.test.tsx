import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PanelContextMenu } from './PanelContextMenu';

import { useLayoutStore } from '@/stores/layout/layout.store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetStore() {
  useLayoutStore.setState({
    layouts: useLayoutStore.getState().layouts,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PanelContextMenu', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <PanelContextMenu
        viewId="dashboard"
        onAddPanel={vi.fn()}
        onResetLayout={vi.fn()}
      >
        <div data-testid="child">Panel Content</div>
      </PanelContextMenu>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('shows context menu on right-click with all items', async () => {
    const user = userEvent.setup();

    render(
      <PanelContextMenu
        viewId="dashboard"
        panelId="panel-1"
        onAddPanel={vi.fn()}
        onResetLayout={vi.fn()}
      >
        <div data-testid="trigger">Panel Content</div>
      </PanelContextMenu>
    );

    await user.pointer({
      keys: '[MouseRight]',
      target: screen.getByTestId('trigger'),
    });

    expect(screen.getByText('Add Panel...')).toBeInTheDocument();
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
    expect(screen.getByText('Reset Layout')).toBeInTheDocument();
  });

  it('calls onAddPanel when Add Panel is clicked', async () => {
    const user = userEvent.setup();
    const onAddPanel = vi.fn();

    render(
      <PanelContextMenu
        viewId="dashboard"
        onAddPanel={onAddPanel}
        onResetLayout={vi.fn()}
      >
        <div data-testid="trigger">Panel Content</div>
      </PanelContextMenu>
    );

    await user.pointer({
      keys: '[MouseRight]',
      target: screen.getByTestId('trigger'),
    });
    await user.click(screen.getByText('Add Panel...'));

    expect(onAddPanel).toHaveBeenCalledOnce();
  });

  it('calls onResetLayout when Reset Layout is clicked', async () => {
    const user = userEvent.setup();
    const onResetLayout = vi.fn();

    render(
      <PanelContextMenu
        viewId="dashboard"
        onAddPanel={vi.fn()}
        onResetLayout={onResetLayout}
      >
        <div data-testid="trigger">Panel Content</div>
      </PanelContextMenu>
    );

    await user.pointer({
      keys: '[MouseRight]',
      target: screen.getByTestId('trigger'),
    });
    await user.click(screen.getByText('Reset Layout'));

    expect(onResetLayout).toHaveBeenCalledOnce();
  });

  it('disables Remove when no panelId provided', async () => {
    const user = userEvent.setup();

    render(
      <PanelContextMenu viewId="dashboard" onAddPanel={vi.fn()}>
        <div data-testid="trigger">Panel Content</div>
      </PanelContextMenu>
    );

    await user.pointer({
      keys: '[MouseRight]',
      target: screen.getByTestId('trigger'),
    });

    const removeItem = screen.getByText('Remove').closest('[data-slot]');
    expect(removeItem).toHaveAttribute('data-disabled');
  });

  it('disables Duplicate (future feature)', async () => {
    const user = userEvent.setup();

    render(
      <PanelContextMenu
        viewId="dashboard"
        panelId="panel-1"
        onAddPanel={vi.fn()}
        onResetLayout={vi.fn()}
      >
        <div data-testid="trigger">Panel Content</div>
      </PanelContextMenu>
    );

    await user.pointer({
      keys: '[MouseRight]',
      target: screen.getByTestId('trigger'),
    });

    const duplicateItem = screen.getByText('Duplicate').closest('[data-slot]');
    expect(duplicateItem).toHaveAttribute('data-disabled');
  });
});
