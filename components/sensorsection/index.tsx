"use client"

import { useConnection } from "@/components/dashboard/ConnectionProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SensorSection(): React.ReactNode {
  const { selectedConnection } = useConnection();

  if (!selectedConnection || selectedConnection.status !== 'connected') {
    return (
      <Card className="mx-4">
        <CardHeader>
          <CardTitle>Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm underline font-semibold">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-4">
      <CardHeader>
        <CardTitle>Sensor Data</CardTitle>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  );
}