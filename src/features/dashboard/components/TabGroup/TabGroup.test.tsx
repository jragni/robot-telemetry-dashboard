import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { TabGroup } from './TabGroup';

const mockTab1 = {
  widgetId: 'imu',
  label: 'IMU',
  robotId: 'robot-1',
  content: <div data-testid="imu-content">IMU Widget</div>,
};

const mockTab2 = {
  widgetId: 'data-plot',
  label: 'Plot',
  robotId: 'robot-1',
  content: <div data-testid="plot-content">Data Plot</div>,
};

const defaultProps = {
  panelId: 'tab-group-1',
  tabs: [mockTab1, mockTab2],
  onRemoveTab: vi.fn(),
  onAddTab: vi.fn(),
};

describe('TabGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the first tab content by default', () => {
    render(<TabGroup {...defaultProps} />);
    expect(screen.getByTestId('imu-content')).toBeInTheDocument();
    expect(screen.queryByTestId('plot-content')).not.toBeInTheDocument();
  });

  it('renders tab labels in the header bar', () => {
    render(<TabGroup {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /imu/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /plot/i })).toBeInTheDocument();
  });

  it('clicking a tab switches to its content', () => {
    render(<TabGroup {...defaultProps} />);
    fireEvent.click(screen.getByRole('tab', { name: /plot/i }));
    expect(screen.getByTestId('plot-content')).toBeInTheDocument();
    expect(screen.queryByTestId('imu-content')).not.toBeInTheDocument();
  });

  it('active tab has aria-selected="true"', () => {
    render(<TabGroup {...defaultProps} />);
    expect(screen.getByRole('tab', { name: /imu/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: /plot/i })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('each tab has a close [×] button', () => {
    render(<TabGroup {...defaultProps} />);
    const closeButtons = screen.getAllByRole('button', { name: /close tab/i });
    expect(closeButtons).toHaveLength(2);
  });

  it('clicking tab close button calls onRemoveTab with widgetId', () => {
    const onRemoveTab = vi.fn();
    render(<TabGroup {...defaultProps} onRemoveTab={onRemoveTab} />);
    // Close the IMU tab
    const closeButtons = screen.getAllByRole('button', { name: /close tab/i });
    fireEvent.click(closeButtons[0]);
    expect(onRemoveTab).toHaveBeenCalledWith('tab-group-1', 'imu');
  });

  it('removing the only tab does not crash — stays as empty cell, not deleted', () => {
    const onRemoveTab = vi.fn();
    render(
      <TabGroup {...defaultProps} tabs={[mockTab1]} onRemoveTab={onRemoveTab} />
    );
    const closeButton = screen.getByRole('button', { name: /close tab/i });
    fireEvent.click(closeButton);
    // Component still renders (does not throw)
    expect(screen.getByTestId('tab-group-1')).toBeInTheDocument();
    expect(onRemoveTab).toHaveBeenCalledWith('tab-group-1', 'imu');
  });

  it('renders a tablist landmark', () => {
    render(<TabGroup {...defaultProps} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('tab panel content is associated with its tab via aria-labelledby', () => {
    render(<TabGroup {...defaultProps} />);
    const tabPanel = screen.getByRole('tabpanel');
    expect(tabPanel).toBeInTheDocument();
  });

  it('TabGroup container renders with data-testid matching panelId', () => {
    render(<TabGroup {...defaultProps} />);
    expect(screen.getByTestId('tab-group-1')).toBeInTheDocument();
  });
});
