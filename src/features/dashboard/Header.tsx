import { Moon, Sun } from 'lucide-react';

import type { HeaderProps } from './definitions';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';

function Header({ isConnected = false }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

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
            <p className="hidden md:block text-xs text-muted-foreground font-mono">
              RCS-1 // TELEOPERATION INTERFACE
              {/* TODO add current robot name and view here */}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
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
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              {/* Hide status text on mobile */}
              <span className="hidden sm:inline text-xs font-mono text-muted-foreground">
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
