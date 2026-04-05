import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';

import { LandingPage } from './LandingPage';

function renderLanding() {
  return render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );
}

describe('LandingPage', () => {
  it('renders the header and footer branding', () => {
    renderLanding();
    const brandElements = screen.getAllByText('Robot Telemetry Dashboard');
    expect(brandElements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the hero headline', () => {
    renderLanding();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/connect/i);
    expect(heading).toHaveTextContent(/monitor/i);
    expect(heading).toHaveTextContent(/command/i);
  });

  it('renders the features section', () => {
    renderLanding();
    expect(screen.getByText('Built for Operators')).toBeInTheDocument();
    const capElements = screen.getAllByText('Capabilities');
    expect(capElements.length).toBeGreaterThanOrEqual(1);
  });

  it('renders CTA buttons', () => {
    renderLanding();
    const demoButtons = screen.getAllByRole('button', { name: /try demo/i });
    expect(demoButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('button', { name: /launch dashboard/i })).toBeInTheDocument();
  });

  it('renders the footer with copyright', () => {
    renderLanding();
    expect(screen.getByText(/© jragni 2026/)).toBeInTheDocument();
  });

  it('renders header navigation links', () => {
    renderLanding();
    const capLink = screen.getByRole('link', { name: /jump to capabilities/i });
    const demoLink = screen.getByRole('link', { name: /jump to demo/i });
    expect(capLink).toHaveAttribute('href', '#features');
    expect(demoLink).toHaveAttribute('href', '#demo');
  });

  it('renders GitHub link in footer', () => {
    renderLanding();
    const ghLinks = screen.getAllByRole('link', { name: /github/i });
    expect(ghLinks.length).toBeGreaterThanOrEqual(1);
    expect(ghLinks[0]).toHaveAttribute('href', expect.stringContaining('github.com'));
    expect(ghLinks[0]).toHaveAttribute('target', '_blank');
  });

  it('forces dark theme on mount', () => {
    renderLanding();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
