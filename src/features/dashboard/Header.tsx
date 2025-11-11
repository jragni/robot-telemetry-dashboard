import { Moon, Settings, Sun } from 'lucide-react';

import type { HeaderProps } from './definitions';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { useRosContext } from '@/features/ros/RosContext';

function Header({ onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { connectionState, activeRobot } = useRosContext();

  const isRosConnected = connectionState === 'connected';

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-3 md:px-4 py-2 md:py-3">
        <div className="flex items-center justify-between">
          <div>
            {/* Mobile: Abbreviated title */}
            <h1 className="text-base md:text-xl font-bold tracking-tight text-foreground">
              <span className="md:hidden">RTD</span>
              <span className="hidden md:inline">
                ROBOT TELEMETRY DASHBOARD
              </span>
            </h1>
            {/* Hide subtitle on mobile */}
            <p className="hidden md:block text-xs text-gray-900 dark:text-[#E8E8E8] font-mono">
              {activeRobot
                ? `${activeRobot.name.toUpperCase()} // TELEOPERATION INTERFACE`
                : 'NO ROBOT SELECTED // TELEOPERATION INTERFACE'}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSidebar}
              className="h-7 px-3 text-xs font-mono"
            >
              <Settings className="h-3 w-3 mr-1.5" />
              CONNECTIONS
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-7 w-7 md:h-8 md:w-8 p-0"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="h-3.5 w-3.5 md:h-4 md:w-4" />
              ) : (
                <Sun className="h-3.5 w-3.5 md:h-4 md:w-4" />
              )}
            </Button>
            <div className="flex items-center gap-1.5 md:gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isRosConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              {/* Hide status text on mobile */}
              <span className="hidden sm:inline text-xs font-mono text-gray-900 dark:text-[#E8E8E8]">
                {isRosConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
