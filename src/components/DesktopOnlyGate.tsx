import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { DesktopOnlyGateProps } from '@/types/DesktopOnlyGate.types';

import { DESKTOP_MIN_WIDTH_PX } from './DesktopOnlyGate.constants';

/** DesktopOnlyGate
 * @description Renders a warning overlay when the viewport is below 1024px,
 *  informing the user that the workspace is designed for desktop. A "Proceed
 *  Anyway" button dismisses the gate for the session.
 * @prop children - The workspace content to render when gate is dismissed or viewport is wide enough.
 */
export function DesktopOnlyGate({ children }: DesktopOnlyGateProps) {
  const [dismissed, setDismissed] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    function check() {
      setIsNarrow(window.innerWidth < DESKTOP_MIN_WIDTH_PX);
    }
    check();
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('resize', check);
    };
  }, []);

  if (!isNarrow || dismissed) {
    return <>{children}</>;
  }

  return (
    <section
      aria-label="Desktop required"
      className="flex flex-col items-center justify-center h-full gap-6 p-8"
    >
      <Monitor className="size-12 text-text-muted" aria-hidden="true" />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-sans text-xl font-semibold text-text-primary">Limited to Desktop Only</p>
        <p className="font-sans text-sm text-text-secondary max-w-80">
          The workspace is designed for viewports 1024px and wider. Resize your window or use a
          larger screen for the best experience.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setDismissed(true);
        }}
        className="font-mono text-xs cursor-pointer"
      >
        Proceed Anyway
      </Button>
    </section>
  );
}
