'use client';

import dynamic from 'next/dynamic';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ControlPanel = dynamic(() => import('./ControlPanel'), { ssr: false });

/**
 * ControlSection
 */
export default function ControlSection() {
  // TODO will re-introduce feature later
  // const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // const { selectedConnection } = useConnection();

  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle>Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ControlPanel />
        {/* TODO will update when features are flushed out */}
        {/* <AddControlModal
          isDialogOpen={isDialogOpen}
          selectedConnection={selectedConnection}
          setIsDialogOpen={setIsDialogOpen}
        /> */}
      </CardContent>
    </Card>
  );
}