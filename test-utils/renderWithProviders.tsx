import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import ConnectionProvider from '@/components/dashboard/ConnectionProvider';
import { ThemeProvider } from 'next-themes';

// Custom render options interface
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withConnectionProvider?: boolean;
  withSidebarProvider?: boolean;
  withThemeProvider?: boolean;
  initialTheme?: string;
}

// All the providers wrapper
function AllTheProviders({ 
  children, 
  withConnectionProvider = true,
  withSidebarProvider = true,
  withThemeProvider = true,
  initialTheme = 'dark'
}: { 
  children: React.ReactNode;
  withConnectionProvider?: boolean;
  withSidebarProvider?: boolean;
  withThemeProvider?: boolean;
  initialTheme?: string;
}) {
  let content = children;

  if (withConnectionProvider) {
    content = (
      <ConnectionProvider>
        {content}
      </ConnectionProvider>
    );
  }

  if (withSidebarProvider) {
    content = (
      <SidebarProvider>
        {content}
      </SidebarProvider>
    );
  }

  if (withThemeProvider) {
    content = (
      <ThemeProvider 
        attribute="class" 
        defaultTheme={initialTheme}
        enableSystem={false}
        disableTransitionOnChange
      >
        {content}
      </ThemeProvider>
    );
  }

  return <>{content}</>;
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    withConnectionProvider = true,
    withSidebarProvider = true,
    withThemeProvider = true,
    initialTheme = 'dark',
    ...renderOptions
  } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        withConnectionProvider={withConnectionProvider}
        withSidebarProvider={withSidebarProvider}
        withThemeProvider={withThemeProvider}
        initialTheme={initialTheme}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Minimal providers for testing specific components
export const renderWithMinimalProviders = (ui: ReactElement, options: RenderOptions = {}) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    ),
    ...options,
  });
};

// Connection provider only
export const renderWithConnectionProvider = (ui: ReactElement, options: RenderOptions = {}) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <ConnectionProvider>
        {children}
      </ConnectionProvider>
    ),
    ...options,
  });
};

// Sidebar provider only
export const renderWithSidebarProvider = (ui: ReactElement, options: RenderOptions = {}) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <SidebarProvider>
        {children}
      </SidebarProvider>
    ),
    ...options,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };