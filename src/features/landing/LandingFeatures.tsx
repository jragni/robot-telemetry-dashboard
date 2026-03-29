import { Activity } from 'lucide-react';
import { FEATURES, FEATURE_ICONS } from './landing.constants';

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 px-8 max-w-[1200px] mx-auto">
      <div className="mb-16">
        <span className="font-mono text-xs font-semibold text-accent uppercase tracking-[0.12em] block mb-3">
          Capabilities
        </span>
        <h2 className="font-sans text-xl font-semibold text-text-primary uppercase tracking-wide">
          Built for Operators
        </h2>
      </div>

      {FEATURES.map((feature) => {
        const Icon = FEATURE_ICONS[feature.number] ?? Activity;
        return (
          <div
            key={feature.number}
            className="landing-feature grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 last:mb-0"
          >
            <div className="landing-feature-content">
              <span className="font-mono text-xs font-semibold text-accent tracking-widest block mb-3">
                {feature.number}
              </span>
              <h3 className="font-sans text-xl font-semibold text-text-primary uppercase tracking-wide mb-3">
                {feature.name}
              </h3>
              <p className="font-sans text-sm text-text-secondary leading-relaxed max-w-[380px]">
                {feature.description}
              </p>
            </div>
            <div className="landing-feature-visual bg-surface-primary border border-border rounded-sm shadow-[inset_0_1px_0_0_var(--color-surface-glow)] h-40 flex items-center justify-center relative">
              <Icon size={36} className="text-accent opacity-30" />
            </div>
          </div>
        );
      })}
    </section>
  );
}
