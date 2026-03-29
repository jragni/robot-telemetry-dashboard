import { useEffect } from 'react';
import { LandingHeader } from './components/LandingHeader';
import { LandingHero } from './components/LandingHero';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingProblemSolution } from './components/LandingProblemSolution';
import { LandingCTA } from './components/LandingCTA';
import { LandingFooter } from './components/LandingFooter';

/**
 *
 */
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
