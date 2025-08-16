'use client';

import dynamic from 'next/dynamic';

import { useSidebar } from '@/components/ui/sidebar';
import DashboardSidebar from '@/components/sidebar';
import SensorSection from '@/components/sensorsection';
import TopicSection from '@/components/topicsection';
import ImuVisualization from '@/components/sensorsection/ImuVisualization';
import LaserScanVisualization from '@/components/sensorsection/LaserScanVisualization';
import PilotModeToggle from '@/components/pilot/PilotModeToggle';
import PilotMode from '@/components/pilot/PilotMode';

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
              {/* Large Desktop: Side-by-side layout (1200px+) */}
              <div className="hidden xl:grid xl:grid-cols-12 gap-2 h-full">
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
                  <div className="h-[32rem]">
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

              {/* Medium Desktop: Optimized stacked layout (768px-1199px) */}
              <div className="hidden md:block xl:hidden h-full overflow-y-auto">
                <div className="space-y-3">
                  {/* Top Row: Controls and LiDAR side by side */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="order-2 lg:order-1">
                      <ControlPanel />
                    </div>
                    <div className="order-1 lg:order-2 h-64 lg:h-80">
                      <div className="h-full bg-gray-800 border border-gray-600 rounded">
                        <LaserScanVisualization />
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Camera - prominent display */}
                  <div className="h-64 lg:h-80">
                    <SensorSection />
                  </div>

                  {/* Bottom Row: IMU - always accessible */}
                  <div className="h-48 lg:h-64 pb-4">
                    <ImuVisualization />
                  </div>
                </div>
              </div>

              {/* Mobile: Scrollable stacked layout (0-767px) */}
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
                <div className="shrink-0 h-72">
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
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex-1">
                  <TopicSection />
                </div>
                <div className="ml-4">
                  <PilotModeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pilot Mode Overlay */}
      <PilotMode />
    </div>
  );
}