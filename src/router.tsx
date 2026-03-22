import { createBrowserRouter } from 'react-router';

import { FleetOverview } from '@/features/fleet/FleetOverview';
import { SharedMapView } from '@/features/map/SharedMapView';
import { RobotWorkspace } from '@/features/robot/RobotWorkspace';
import { AppShell } from '@/shared/components/AppShell';
import { NotFoundView } from '@/shared/components/NotFoundView';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <FleetOverview /> },
        { path: 'robot/:robotId', element: <RobotWorkspace /> },
        { path: 'map', element: <SharedMapView /> },
      ],
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
