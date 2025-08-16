'use client';

import { useSidebar } from '@/components/ui/sidebar';
import ControlSection from '@/components/controlsection';
import DashboardSidebar from '@/components/sidebar';
import SensorSection from '@/components/sensorsection';
import TopicSection from '@/components/topicsection';

export default function DashboardLayout() {
  const { open } = useSidebar();

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      {/* Spacer for fixed collapsed sidebar */}
      {!open && <div className="w-16 shrink-0" />}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="p-4 space-y-6 max-w-7xl mx-auto">
            <SensorSection />
            <ControlSection />
            <TopicSection />
          </div>
        </div>
      </main>
    </div>
  );
}