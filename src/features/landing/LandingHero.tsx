import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <section className="landing-scanlines landing-scan-beam min-h-dvh flex items-center relative overflow-hidden pt-12 px-8">
      <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-12 items-center relative z-2">
        <div className="flex flex-col gap-6">
          <span className="font-mono text-xs font-semibold text-accent uppercase tracking-[0.12em]">
            Fleet Telemetry Platform
          </span>

          <h1 className="font-sans text-4xl font-semibold leading-none tracking-[0.08em] uppercase text-text-primary">
            Connect.
            <br />
            Monitor.
            <br />
            Command.
          </h1>

          <p className="font-sans text-sm text-text-secondary leading-relaxed max-w-[400px]">
            Fleet-wide robot telemetry in a single workspace. Connect to any
            ROS2 robot via rosbridge, stream live sensor data, and operate
            directly from the browser.
          </p>

          <div className="flex gap-3 mt-2 flex-col sm:flex-row">
            <Button
              onClick={() => {
                void navigate('/fleet');
              }}
              className="uppercase tracking-wide px-8 py-3 hover:shadow-[0_0_24px_var(--color-accent-glow),0_8px_16px_var(--color-shadow)] hover:-translate-y-0.5"
            >
              Launch Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                void navigate('/demo');
              }}
              className="uppercase tracking-wide px-8 py-3 text-accent border-accent hover:bg-accent-subtle hover:-translate-y-0.5"
            >
              Try Demo
            </Button>
          </div>
        </div>

        {/* TODO: Replace with real dashboard screenshot once workspace feature is built */}
        <div className="hidden md:block" style={{ perspective: '1200px' }}>
          <div
            className="w-full bg-surface-primary border border-border rounded-sm shadow-[0_0_40px_var(--color-accent-subtle),0_20px_60px_var(--color-shadow-heavy)] flex items-center justify-center font-mono text-xs text-text-muted"
            style={{
              aspectRatio: '16/10',
              transform: 'rotateY(-6deg) rotateX(2deg)',
            }}
          >
            Dashboard screenshot — pending
          </div>
        </div>
      </div>
    </section>
  );
}
