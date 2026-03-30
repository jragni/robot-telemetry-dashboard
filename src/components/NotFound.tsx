import { Link, useLocation } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Renders the 404 page displayed when a route does not exist.
 * Shows the invalid path and provides recovery navigation.
 */
export function NotFound() {
  const location = useLocation();

  return (
    <section
      role="alert"
      className="flex flex-col items-center justify-center h-full gap-6 px-8"
    >
      <Radio size={36} className="text-accent opacity-30" />
      <h2 className="font-sans text-xl font-semibold text-text-primary">
        Page Not Found
      </h2>
      <p className="font-sans text-xs text-text-muted max-w-85 text-center leading-relaxed">
        The requested route does not exist.
      </p>
      <code className="font-mono text-xs text-accent">{location.pathname}</code>
      <Button
        asChild
        variant="outline"
        className="font-sans text-xs uppercase tracking-widest text-accent border-accent hover:bg-accent-subtle"
      >
        <Link to="/fleet">Return to Fleet</Link>
      </Button>
    </section>
  );
}
