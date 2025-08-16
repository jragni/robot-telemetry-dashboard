'use client';

import { useConnection } from '@/components/dashboard/ConnectionProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LaserScanVisualization from './LaserScanVisualization';

export default function SensorSection(): React.ReactNode {
  const { selectedConnection } = useConnection();

  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sensor Data</CardTitle>
      </CardHeader>
      <CardContent>
        <LaserScanVisualization />
      </CardContent>
    </Card>
  );
}