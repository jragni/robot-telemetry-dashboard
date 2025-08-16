'use client';

import { usePilotMode } from './usePilotMode';
import { Button } from '@/components/ui/button';
import { Maximize } from 'lucide-react';

export default function PilotModeToggle() {
  const { isPilotMode, togglePilotMode } = usePilotMode();

  return (
    <Button
      className="flex items-center gap-2"
      onClick={togglePilotMode}
      size="sm"
      variant={isPilotMode ? 'destructive' : 'default'}
    >
      <Maximize className="h-4 w-4" />
      {isPilotMode ? 'Exit Pilot' : 'Pilot Mode'}
    </Button>
  );
}