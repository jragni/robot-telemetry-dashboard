import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DataPlotWidget } from './DataPlotWidget';

vi.mock('../../hooks/useDataPlot', () => ({
  useDataPlot: vi.fn(),
}));

vi.mock('../../hooks/useRosConnection', () => ({
  useRosConnection: vi.fn(),
}));

const defaultProps = {
  robotId: 'robot-1',
  panelId: 'panel-1',
  topicName: '/cmd_vel',
  selectedFields: ['linear.x', 'angular.z'],
};

const connectedResult = {
  isConnected: true,
  transport: {},
  connectionState: 'connected' as const,
};

const mockPlotData = {
  availableFields: [
    'linear.x',
    'linear.y',
    'linear.z',
    'angular.x',
    'angular.y',
    'angular.z',
  ],
  timestamps: [1000, 1100, 1200],
  series: {
    'linear.x': [1.0, 1.5, 2.0],
    'angular.z': [0.1, 0.2, 0.3],
  },
};

describe('DataPlotWidget', () => {
  beforeEach(async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue(connectedResult);

    const { useDataPlot } = await import('../../hooks/useDataPlot');
    vi.mocked(useDataPlot).mockReturnValue(mockPlotData);
  });

  it('renders without crashing', () => {
    render(<DataPlotWidget {...defaultProps} />);
  });

  it('renders a chart container', () => {
    render(<DataPlotWidget {...defaultProps} />);
    expect(screen.getByTestId('data-plot-chart')).toBeInTheDocument();
  });

  it('renders checkboxes for each available field', () => {
    render(<DataPlotWidget {...defaultProps} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(mockPlotData.availableFields.length);
  });

  it('renders field labels in the field picker', () => {
    render(<DataPlotWidget {...defaultProps} />);
    for (const field of mockPlotData.availableFields) {
      expect(screen.getByText(field)).toBeInTheDocument();
    }
  });

  it('selected fields have checked checkboxes', () => {
    render(<DataPlotWidget {...defaultProps} />);
    const linearXCheckbox = screen.getByRole('checkbox', {
      name: /linear\.x/i,
    });
    expect(linearXCheckbox).toBeChecked();
  });

  it('unselected fields have unchecked checkboxes', () => {
    render(<DataPlotWidget {...defaultProps} />);
    const linearYCheckbox = screen.getByRole('checkbox', {
      name: /linear\.y/i,
    });
    expect(linearYCheckbox).not.toBeChecked();
  });

  it('renders NoConnectionOverlay when disconnected', async () => {
    const { useRosConnection } = await import('../../hooks/useRosConnection');
    vi.mocked(useRosConnection).mockReturnValue({
      isConnected: false,
      transport: null,
      connectionState: 'disconnected',
    });

    render(<DataPlotWidget {...defaultProps} />);
    expect(screen.getByTestId('no-connection-overlay')).toBeInTheDocument();
  });

  it('renders "No numeric fields" empty state when no fields available', async () => {
    const { useDataPlot } = await import('../../hooks/useDataPlot');
    vi.mocked(useDataPlot).mockReturnValue({
      availableFields: [],
      timestamps: [],
      series: {},
    });

    render(<DataPlotWidget {...defaultProps} selectedFields={[]} />);
    expect(screen.getByText(/no numeric fields/i)).toBeInTheDocument();
  });

  it('renders "Select fields above" hint when all fields deselected', async () => {
    const { useDataPlot } = await import('../../hooks/useDataPlot');
    vi.mocked(useDataPlot).mockReturnValue({
      availableFields: ['linear.x', 'angular.z'],
      timestamps: [],
      series: {},
    });

    render(<DataPlotWidget {...defaultProps} selectedFields={[]} />);
    expect(screen.getByText(/select fields above/i)).toBeInTheDocument();
  });

  it('renders performance warning badge when >5 series selected', () => {
    render(
      <DataPlotWidget
        {...defaultProps}
        selectedFields={[
          'linear.x',
          'linear.y',
          'linear.z',
          'angular.x',
          'angular.y',
          'angular.z',
        ]}
      />
    );
    expect(screen.getByText(/high series count/i)).toBeInTheDocument();
  });
});
