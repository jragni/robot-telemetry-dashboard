import { useState, useCallback, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConditionalRender } from '@/components/ConditionalRender';
import { useTheme } from '@/hooks/useTheme';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';

/**
 * Renders the top-level shell layout with sidebar, header,
 * statusbar, content area, and mobile drawer.
 */
export function AppShell() {
  const { theme, toggle } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleDrawer = useCallback(() => {
    setDrawerOpen((prev) => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div
      className={`shell-grid ${sidebarCollapsed ? 'shell-grid--collapsed' : ''}`}
    >
      <div className="shell-header">
        <Header
          showHamburger
          onToggleDrawer={toggleDrawer}
          theme={theme}
          onToggleTheme={toggle}
        />
      </div>

      <div className="shell-sidebar">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      <ConditionalRender
        shouldRender={drawerOpen}
        Component={
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeDrawer}
            aria-hidden="true"
          />
        }
      />

      <div
        className={`shell-drawer fixed top-10 bottom-0 left-0 w-65 z-50 bg-surface-primary border-r border-border transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden ${
          drawerOpen ? 'translate-x-0 shell-drawer--open' : '-translate-x-full'
        }`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={closeDrawer}
          aria-label="Close navigation"
          className="absolute top-2 right-2 w-7 h-7 text-text-muted bg-surface-tertiary border border-border hover:border-border-hover hover:text-text-primary"
        >
          <X size={14} />
        </Button>
        <Sidebar collapsed={false} onToggleCollapse={closeDrawer} />
      </div>

      <main className="shell-content">
        <Outlet />
      </main>

      <div className="shell-statusbar">
        <StatusBar />
      </div>
    </div>
  );
}
