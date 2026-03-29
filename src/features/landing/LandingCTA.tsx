import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function LandingCTA() {
  const navigate = useNavigate();

  return (
    <section
      id="demo"
      className="py-24 px-8 text-center flex flex-col items-center gap-6"
    >
      <h2 className="font-sans text-xl font-semibold text-text-primary uppercase tracking-wide">
        See It in Action
      </h2>
      <p className="font-sans text-sm text-text-muted max-w-100">
        No rosbridge required. The demo loads mock robots with streaming
        telemetry data so you can experience the full interface.
      </p>
      <Button
        onClick={() => {
          void navigate('/demo');
        }}
        className="uppercase tracking-wide px-8 py-3 hover:shadow-[0_0_24px_var(--color-accent-glow),0_8px_16px_var(--color-shadow)] hover:-translate-y-0.5"
      >
        Try Demo
      </Button>
    </section>
  );
}
