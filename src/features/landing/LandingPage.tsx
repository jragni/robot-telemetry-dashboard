import { useEffect } from 'react';
import { LandingHeader } from './components/LandingHeader';
import { LandingHero } from './components/LandingHero';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingProblemSolution } from './components/LandingProblemSolution';
import { LandingCTA } from './components/LandingCTA';
import { LandingFooter } from './components/LandingFooter';

/** LandingPage
 * @description Renders the standalone landing page with hero, features,
 *  problem/solution, CTA, and footer sections. Forces dark theme on mount.
 */
export function LandingPage() {
  // Force dark theme — standalone page outside AppShell
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <main className="bg-surface-base text-text-primary min-h-dvh">
      <LandingHeader />
      <LandingHero />
      <div className="landing-divider" />
      <LandingFeatures />
      <div className="landing-divider" />
      <LandingProblemSolution />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
