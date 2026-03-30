import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ComingSoonProps } from '@/types/ComingSoon.types';

/** ComingSoon
 * @description Renders a placeholder for features under development.
 *  Directs users to available features.
 * @param label - The feature name displayed in the heading.
 */
export function ComingSoon({ label }: ComingSoonProps) {
  return (
    <section className="flex flex-col items-center justify-center h-full gap-6 px-8">
      <Wrench size={36} className="text-accent opacity-30" />
      <h2 className="font-sans text-xl font-semibold text-text-primary">
        {label} — Coming Soon
      </h2>
      <p className="font-sans text-xs text-text-muted max-w-85 text-center leading-relaxed">
        This feature is under development. Fleet and Workspace are available
        now.
      </p>
      <Button
        asChild
        variant="outline"
        className="font-sans text-xs uppercase tracking-widest text-accent border-accent hover:bg-accent-subtle"
      >
        <Link to="/fleet">Go to Fleet</Link>
      </Button>
    </section>
  );
}
