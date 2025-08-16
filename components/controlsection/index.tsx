'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

import { useConnection } from '@/components/dashboard/ConnectionProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import AddControlModal from './AddControlModal';

const ControlPanel = dynamic(() => import('./ControlPanel'), { ssr: false });

/**
 * ControlSection
 */
export default function ControlSection() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { selectedConnection } = useConnection();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ControlPanel />
        <AddControlModal
          isDialogOpen={isDialogOpen}
          selectedConnection={selectedConnection}
          setIsDialogOpen={setIsDialogOpen}
        />
      </CardContent>
    </Card>
  );
}