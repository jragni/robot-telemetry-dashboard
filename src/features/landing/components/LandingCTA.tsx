import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/** LandingCTA
 * @description Renders the call-to-action section with demo button and
 *  descriptive text.
 */
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
        className="uppercase tracking-wide px-8 py-3 hover:shadow-glow-accent hover:-translate-y-0.5"
      >
        Try Demo
      </Button>
    </section>
  );
}
