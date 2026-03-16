import { Toaster } from 'sonner';

import { AppShell } from '@/components/layout/AppShell';

export function App() {
  return (
    <>
      <AppShell />
      <Toaster richColors position="bottom-right" />
    </>
  );
}
