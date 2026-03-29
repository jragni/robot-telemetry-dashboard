import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../hooks/useTheme';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';

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

  return (
    <div
      className={`shell-grid ${sidebarCollapsed ? 'shell-grid--collapsed' : ''}`}
    >
      {/* Header */}
      <div className="shell-header">
        <Header
          showHamburger
          onToggleDrawer={toggleDrawer}
          theme={theme}
          onToggleTheme={toggle}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="shell-sidebar">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </div>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeDrawer}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeDrawer();
          }}
          role="button"
          tabIndex={-1}
          aria-label="Close navigation"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-10 bottom-0 left-0 w-65 z-50 bg-surface-primary border-r border-border transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxShadow: drawerOpen
            ? '4px 0 24px var(--color-shadow-heavy)'
            : 'none',
        }}
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

      {/* Main content */}
      <main className="shell-content">
        <Outlet />
      </main>

      {/* Statusbar */}
      <div className="shell-statusbar">
        <StatusBar />
      </div>
    </div>
  );
}
