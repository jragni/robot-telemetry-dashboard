import { render, screen } from '@testing-library/react';

import { DataCard } from './DataCard';

describe('DataCard', () => {
  it('renders title and children', () => {
    render(
      <DataCard title="Battery">
        <span>85%</span>
      </DataCard>
    );
    expect(screen.getByText('Battery')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders status indicator when status is provided', () => {
    render(
      <DataCard title="GPS" status="connected">
        <span>data</span>
      </DataCard>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('does not render status indicator when status is omitted', () => {
    render(
      <DataCard title="GPS">
        <span>data</span>
      </DataCard>
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders header actions when provided', () => {
    render(
      <DataCard title="IMU" headerActions={<button>Settings</button>}>
        <span>data</span>
      </DataCard>
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DataCard title="Test" className="w-full">
        content
      </DataCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('w-full');
  });
});
