'use client';

import dynamic from 'next/dynamic';

import { useSidebar } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/sidebar';
import SensorSection from '@/components/sensorsection';
import TopicSection from '@/components/topicsection';
import ImuVisualization from '@/components/sensorsection/ImuVisualization';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';

const ControlPanel = dynamic(() => import('@/components/controlsection/ControlPanel'), { ssr: false });

export default function DashboardLayout() {
  const { open } = useSidebar();

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      {/* Spacer for fixed collapsed sidebar */}
      {!open && <div className="w-16 shrink-0" />}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-hidden bg-gray-900 text-white">
          <div className="h-full flex flex-col">
            {/* Main Operator Console - Responsive Layout */}
            <div className="flex-1 p-2 min-h-0">
              {/* Desktop: Side-by-side layout */}
              <div className="hidden md:grid md:grid-cols-12 gap-2 h-full">
                {/* Left: Camera Feed & IMU */}
                <div className="col-span-8 flex flex-col gap-2 min-h-0">
                  {/* Camera - Takes most space */}
                  <div className="flex-1 min-h-0">
                    <div className="h-full">
                      <SensorSection />
                    </div>
                  </div>

                  {/* IMU Telemetry - Below camera with more space */}
                  <div className="h-80">
                    <ImuVisualization />
                  </div>
                </div>

                {/* Right: LiDAR & Mission Controls */}
                <div className="col-span-4 flex flex-col gap-2 min-h-0">
                  {/* LiDAR - Larger size */}
                  <div className="h-[28rem]">
                    <div className="h-full bg-gray-800 border border-gray-600 rounded">
                      <LaserScanVisualization />
                    </div>
                  </div>

                  {/* Controls - Remaining space */}
                  <div className="flex-1">
                    <ControlPanel />
                  </div>
                </div>
              </div>

              {/* Mobile: Scrollable stacked layout */}
              <div className="md:hidden h-full flex flex-col gap-2 overflow-y-auto">
                {/* Controls First - Always accessible */}
                <div className="shrink-0">
                  <ControlPanel />
                </div>

                {/* Camera - Fixed height for consistent sizing */}
                <div className="shrink-0 h-64">
                  <SensorSection />
                </div>

                {/* LiDAR - Fixed height */}
                <div className="shrink-0 h-60">
                  <div className="h-full bg-gray-800 border border-gray-600 rounded">
                    <LaserScanVisualization />
                  </div>
                </div>

                {/* IMU - Ensure it's always visible */}
                <div className="shrink-0 h-32 pb-4">
                  <ImuVisualization />
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="h-auto border-t border-gray-700 bg-gray-800/50">
              <TopicSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}