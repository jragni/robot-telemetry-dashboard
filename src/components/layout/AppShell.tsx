import { RouterProvider } from 'react-router';

import { router } from '@/router';

export function AppShell() {
  return <RouterProvider router={router} />;
}
