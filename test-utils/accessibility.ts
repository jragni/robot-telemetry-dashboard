import { vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import type { RenderResult } from '@testing-library/react';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Accessibility testing configuration
const a11yConfig = {
  rules: {
    // Disable color-contrast rule for now (can be flaky in tests)
    'color-contrast': { enabled: false },
    // Focus management
    'focus-order-semantics': { enabled: true },
    'focusable-content': { enabled: true },
    // ARIA
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    // Landmarks
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },
    // Headings
    'heading-order': { enabled: true },
    'empty-heading': { enabled: true },
    // Images
    'image-alt': { enabled: true },
    // Forms
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    // Links
    'link-name': { enabled: true },
    'link-in-text-block': { enabled: true },
    // Tables
    'table-header-scope': { enabled: true },
    'table-fake-caption': { enabled: true },
    // Lists
    'list': { enabled: true },
    'listitem': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
};

// Test accessibility of a rendered component
export const testAccessibility = async (rendered: RenderResult) => {
  const results = await axe(rendered.container, a11yConfig);
  expect(results).toHaveNoViolations();
  return results;
};

// Test keyboard navigation
export const testKeyboardNavigation = async (rendered: RenderResult) => {
  const { container } = rendered;
  
  // Get all focusable elements
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  // Test tab order
  for (let i = 0; i < focusableElements.length; i++) {
    const element = focusableElements[i] as HTMLElement;
    element.focus();
    expect(document.activeElement).toBe(element);
  }
  
  return focusableElements;
};

// Test ARIA attributes
export const testAriaAttributes = (rendered: RenderResult) => {
  const { container } = rendered;
  
  // Check for proper ARIA labels on interactive elements
  const interactiveElements = container.querySelectorAll(
    'button, [role="button"], input, select, textarea, [role="textbox"], [role="combobox"]'
  );
  
  interactiveElements.forEach((element) => {
    const hasAriaLabel = element.hasAttribute('aria-label');
    const hasAriaLabelledBy = element.hasAttribute('aria-labelledby');
    const hasAriaDescribedBy = element.hasAttribute('aria-describedby');
    const hasTitle = element.hasAttribute('title');
    const hasTextContent = element.textContent?.trim();
    
    // At least one way to identify the element should exist
    expect(
      hasAriaLabel || 
      hasAriaLabelledBy || 
      hasAriaDescribedBy || 
      hasTitle || 
      hasTextContent
    ).toBe(true);
  });
  
  return interactiveElements;
};

// Test color contrast (when enabled)
export const testColorContrast = async (rendered: RenderResult) => {
  const colorContrastConfig = {
    ...a11yConfig,
    rules: {
      ...a11yConfig.rules,
      'color-contrast': { enabled: true },
    },
  };
  
  const results = await axe(rendered.container, colorContrastConfig);
  expect(results).toHaveNoViolations();
  return results;
};

// Test screen reader compatibility
export const testScreenReaderCompatibility = (rendered: RenderResult) => {
  const { container } = rendered;
  
  // Check for proper heading structure
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
  let lastLevel = 0;
  
  headings.forEach((heading) => {
    const level = heading.tagName === 'H1' ? 1 :
                  heading.tagName === 'H2' ? 2 :
                  heading.tagName === 'H3' ? 3 :
                  heading.tagName === 'H4' ? 4 :
                  heading.tagName === 'H5' ? 5 :
                  heading.tagName === 'H6' ? 6 :
                  parseInt(heading.getAttribute('aria-level') || '1');
    
    // Check that heading levels don't skip (e.g., h1 -> h3)
    if (lastLevel > 0) {
      expect(level - lastLevel).toBeLessThanOrEqual(1);
    }
    
    lastLevel = level;
  });
  
  // Check for proper landmark structure
  const main = container.querySelector('main, [role="main"]');
  const nav = container.querySelector('nav, [role="navigation"]');
  const header = container.querySelector('header, [role="banner"]');
  
  // At least main content should be present
  if (container.children.length > 0) {
    // Only check if this is a full page component
    const isFullPage = container.querySelector('html, body') !== null;
    if (isFullPage) {
      expect(main).toBeTruthy();
    }
  }
  
  return { headings, main, nav, header };
};

// Test mobile accessibility
export const testMobileAccessibility = async (rendered: RenderResult) => {
  const { container } = rendered;
  
  // Check for proper touch targets (minimum 44px)
  const touchTargets = container.querySelectorAll('button, [role="button"], a, input[type="checkbox"], input[type="radio"]');
  
  touchTargets.forEach((target) => {
    const rect = target.getBoundingClientRect();
    // Note: In tests, getBoundingClientRect might return 0 values
    // This is more for documentation and real browser testing
    if (rect.width > 0 && rect.height > 0) {
      expect(Math.max(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
    }
  });
  
  // Check for proper spacing between interactive elements
  const interactiveElements = Array.from(touchTargets);
  for (let i = 0; i < interactiveElements.length - 1; i++) {
    const current = interactiveElements[i].getBoundingClientRect();
    const next = interactiveElements[i + 1].getBoundingClientRect();
    
    if (current.width > 0 && next.width > 0) {
      const distance = Math.abs(current.bottom - next.top);
      expect(distance).toBeGreaterThanOrEqual(8); // Minimum 8px spacing
    }
  }
  
  return touchTargets;
};

// Mock user preferences for testing
export const mockUserPreferences = {
  reducedMotion: () => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query: string) => {
        if (query.includes('prefers-reduced-motion')) {
          return { matches: true, media: query };
        }
        return { matches: false, media: query };
      }),
    });
  },
  
  highContrast: () => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query: string) => {
        if (query.includes('prefers-contrast')) {
          return { matches: true, media: query };
        }
        return { matches: false, media: query };
      }),
    });
  },
  
  darkMode: () => {
    Object.defineProperty(window, 'matchMedia', {
      value: vi.fn().mockImplementation((query: string) => {
        if (query.includes('prefers-color-scheme: dark')) {
          return { matches: true, media: query };
        }
        return { matches: false, media: query };
      }),
    });
  },
};

// Comprehensive accessibility test suite
export const runFullAccessibilityTest = async (rendered: RenderResult) => {
  const results = {
    axeResults: await testAccessibility(rendered),
    keyboardNavigation: await testKeyboardNavigation(rendered),
    ariaAttributes: testAriaAttributes(rendered),
    screenReader: testScreenReaderCompatibility(rendered),
    mobileAccessibility: await testMobileAccessibility(rendered),
  };
  
  return results;
};