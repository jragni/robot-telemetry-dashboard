import { createBrowserRouter, Navigate } from 'react-router';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { DashboardView } from '@/views/DashboardView';
import { FleetView } from '@/views/FleetView';
import { MapView } from '@/views/MapView';
import { NotFoundView } from '@/views/NotFoundView';
import { PilotView } from '@/views/PilotView';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      element: <DashboardShell />,
      children: [
        {
          path: '/dashboard',
          element: <DashboardView />,
        },
        {
          path: '/fleet',
          element: <FleetView />,
        },
        {
          path: '/map',
          element: <MapView />,
        },
      ],
    },
    {
      path: '/pilot/:robotId',
      element: <PilotView />,
    },
    {
      path: '*',
      element: <NotFoundView />,
    },
  ],
  {
    basename: '/robot-telemetry-dashboard/',
  }
);
