import { Toaster } from 'sonner';

import { AppShell } from '@/components/layout/AppShell';
import { TooltipProvider } from '@/components/ui/tooltip';

export function App() {
  return (
    <TooltipProvider>
      <AppShell />
      <Toaster richColors position="bottom-right" />
    </TooltipProvider>
  );
}
