import { createBrowserRouter, Navigate } from 'react-router';

import { DashboardView } from '@/features/dashboard/DashboardView';
import { FleetView } from '@/features/fleet/FleetView';
import { MapView } from '@/features/map/MapView';
import { PilotPickerView } from '@/features/pilot/PilotPickerView';
import { PilotView } from '@/features/pilot/PilotView';
import { DashboardShell } from '@/shared/components/DashboardShell';
import { NotFoundView } from '@/shared/components/NotFoundView';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <DashboardShell />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardView /> },
        { path: 'fleet', element: <FleetView /> },
        { path: 'map', element: <MapView /> },
        { path: 'pilot', element: <PilotPickerView /> },
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
