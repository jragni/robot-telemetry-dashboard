import { useEffect } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingHero } from './LandingHero';
import { LandingFeatures } from './LandingFeatures';
import { LandingProblemSolution } from './LandingProblemSolution';
import { LandingCTA } from './LandingCTA';
import { LandingFooter } from './LandingFooter';

export function LandingPage() {
  // Force dark theme — standalone page outside AppShell
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <div className="bg-surface-base text-text-primary min-h-dvh">
      <LandingHeader />
      <LandingHero />
      <div className="landing-divider" />
      <LandingFeatures />
      <div className="landing-divider" />
      <LandingProblemSolution />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
