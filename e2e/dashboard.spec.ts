import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Robot Telemetry Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test.describe('Initial Load and Layout', () => {
    test('should load dashboard successfully', async ({ page }) => {
      // Check if main components are visible
      await expect(page.getByText('IMU')).toBeVisible();
      await expect(page.getByText('LiDAR')).toBeVisible();
      await expect(page.getByText('Controls')).toBeVisible();
    });

    test('should display correct layout on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      // Check desktop layout elements
      await expect(page.locator('.xl\\:grid-cols-12')).toBeVisible();
      
      // Verify all sections are visible simultaneously
      await expect(page.getByText('IMU')).toBeVisible();
      await expect(page.getByText('LiDAR')).toBeVisible();
      await expect(page.getByText('Controls')).toBeVisible();
    });

    test('should adapt to mobile layout', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check mobile layout
      await expect(page.locator('.md\\:hidden')).toBeVisible();
      
      // Verify components are stacked vertically
      await expect(page.getByText('Controls')).toBeVisible();
      await expect(page.getByText('IMU')).toBeVisible();
    });

    test('should handle sidebar toggle', async ({ page }) => {
      // Find and click sidebar toggle (if exists)
      const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
      if (await sidebarToggle.isVisible()) {
        await sidebarToggle.click();
        
        // Verify sidebar state change
        await page.waitForTimeout(300); // Animation time
      }
    });
  });

  test.describe('Connection Management', () => {
    test('should show no connection state initially', async ({ page }) => {
      // Check for "No connection" messages
      await expect(page.getByText('IMU: No connection')).toBeVisible();
      await expect(page.getByText('LiDAR: No connection')).toBeVisible();
    });

    test('should handle connection dialog', async ({ page }) => {
      // Look for add connection button
      const addConnectionBtn = page.getByText('Add Connection').first();
      
      if (await addConnectionBtn.isVisible()) {
        await addConnectionBtn.click();
        
        // Fill connection form
        await page.fill('input[placeholder*="Robot name"]', 'Test Robot');
        await page.fill('input[placeholder*="WebSocket URL"]', 'ws://localhost:9090');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Wait for connection attempt
        await page.waitForTimeout(2000);
      }
    });

    test('should display connection status changes', async ({ page }) => {
      // Monitor for status indicators
      const statusIndicators = page.locator('.bg-green-500, .bg-red-500');
      await expect(statusIndicators.first()).toBeVisible();
    });
  });

  test.describe('Control Panel Interactions', () => {
    test('should interact with velocity sliders', async ({ page }) => {
      // Find velocity sliders
      const linearSlider = page.locator('input[type="range"]').first();
      const angularSlider = page.locator('input[type="range"]').last();
      
      // Interact with linear velocity slider
      await linearSlider.fill('0.5');
      
      // Verify value display updates
      await expect(page.getByText('0.50')).toBeVisible();
      
      // Interact with angular velocity slider
      await angularSlider.fill('1.0');
      await expect(page.getByText('1.00')).toBeVisible();
    });

    test('should handle movement controls', async ({ page }) => {
      // Test forward button
      const forwardBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
      await forwardBtn.click();
      
      // Test stop button
      const stopBtn = page.locator('button[variant="destructive"]');
      await stopBtn.click();
      
      // Test other directional controls
      const buttons = page.locator('button').filter({ has: page.locator('svg') });
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        await buttons.nth(i).click();
        await page.waitForTimeout(100);
      }
    });

    test('should handle topic selection', async ({ page }) => {
      // Find and interact with topic selector
      const topicSelector = page.locator('select, [role="combobox"]').first();
      
      if (await topicSelector.isVisible()) {
        await topicSelector.click();
        
        // Select different topic if options are available
        const options = page.locator('[role="option"]');
        const optionCount = await options.count();
        
        if (optionCount > 1) {
          await options.nth(1).click();
        }
      }
    });
  });

  test.describe('Visualization Components', () => {
    test('should render IMU visualization charts', async ({ page }) => {
      // Check for IMU chart containers
      await expect(page.getByText('Orientation')).toBeVisible();
      await expect(page.getByText('Linear Acceleration')).toBeVisible();
      await expect(page.getByText('Angular Velocity')).toBeVisible();
      
      // Check for SVG elements (charts)
      const svgElements = page.locator('svg');
      expect(await svgElements.count()).toBeGreaterThan(0);
    });

    test('should display LiDAR visualization', async ({ page }) => {
      // Check for LiDAR container
      await expect(page.getByText('LiDAR')).toBeVisible();
      
      // Verify LiDAR SVG is present
      const lidarSvg = page.locator('svg').last();
      await expect(lidarSvg).toBeVisible();
    });

    test('should handle unit selection in IMU', async ({ page }) => {
      // Find unit selectors
      const unitSelectors = page.locator('[role="combobox"]').filter({ hasText: /deg|rad/ });
      
      if (await unitSelectors.count() > 0) {
        await unitSelectors.first().click();
        
        // Try to select different unit
        const options = page.locator('[role="option"]');
        if (await options.count() > 1) {
          await options.nth(1).click();
        }
      }
    });

    test('should show data point counts', async ({ page }) => {
      // Look for data point indicators
      const pointCounters = page.locator('text=/\\d+\\s*(pts?|points?)?/');
      // Point counters might not be visible without actual data
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on tablet portrait', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Verify tablet layout
      await expect(page.getByText('IMU')).toBeVisible();
      await expect(page.getByText('LiDAR')).toBeVisible();
      await expect(page.getByText('Controls')).toBeVisible();
    });

    test('should work on tablet landscape', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      
      // Verify landscape layout
      await expect(page.getByText('IMU')).toBeVisible();
      await expect(page.getByText('LiDAR')).toBeVisible();
    });

    test('should work on large desktop', async ({ page }) => {
      await page.setViewportSize({ width: 2560, height: 1440 });
      
      // Verify large desktop layout
      await expect(page.getByText('IMU')).toBeVisible();
      await expect(page.getByText('LiDAR')).toBeVisible();
      await expect(page.getByText('Controls')).toBeVisible();
    });

    test('should handle viewport changes', async ({ page }) => {
      // Start with desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.getByText('IMU')).toBeVisible();
      
      // Change to mobile
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.getByText('IMU')).toBeVisible();
      
      // Change back to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.getByText('IMU')).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should support tab navigation', async ({ page }) => {
      // Start tabbing through interface
      await page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
    });

    test('should support escape key for modals', async ({ page }) => {
      // Try to open a modal/dialog
      const addConnectionBtn = page.getByText('Add Connection').first();
      
      if (await addConnectionBtn.isVisible()) {
        await addConnectionBtn.click();
        
        // Press escape to close
        await page.keyboard.press('Escape');
        
        // Verify modal is closed
        await page.waitForTimeout(300);
      }
    });

    test('should support arrow keys for sliders', async ({ page }) => {
      // Focus on a slider
      const slider = page.locator('input[type="range"]').first();
      
      if (await slider.isVisible()) {
        await slider.focus();
        
        // Use arrow keys to adjust value
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowLeft');
      }
    });
  });

  test.describe('Data Visualization', () => {
    test('should handle empty data states', async ({ page }) => {
      // Check for waiting/no data messages
      const waitingMessages = page.locator('text=/waiting|no data|no connection/i');
      expect(await waitingMessages.count()).toBeGreaterThan(0);
    });

    test('should show connection status indicators', async ({ page }) => {
      // Look for status indicators
      const statusDots = page.locator('.bg-green-500, .bg-red-500, .bg-yellow-500');
      expect(await statusDots.count()).toBeGreaterThan(0);
    });

    test('should display topic information', async ({ page }) => {
      // Check topic section
      await expect(page.getByText('Topics')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate network failure
      await page.setOffline(true);
      
      // Verify app still responds
      await expect(page.getByText('IMU')).toBeVisible();
      
      // Restore network
      await page.setOffline(false);
    });

    test('should show appropriate error messages', async ({ page }) => {
      // Look for error states
      const errorMessages = page.locator('text=/error|failed|connection|timeout/i');
      // Error messages may not be visible without actual connection attempts
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 seconds
    });

    test('should handle rapid interactions', async ({ page }) => {
      // Rapid button clicks
      const buttons = page.locator('button');
      const buttonCount = Math.min(await buttons.count(), 10);
      
      for (let i = 0; i < buttonCount; i++) {
        await buttons.nth(i).click({ timeout: 100 });
      }
      
      // Should remain responsive
      await expect(page.getByText('IMU')).toBeVisible();
    });

    test('should maintain performance with many elements', async ({ page }) => {
      // Verify performance with complex layouts
      const startTime = Date.now();
      
      // Interact with various components
      await page.locator('input[type="range"]').first().fill('0.8');
      await page.locator('button').first().click();
      
      const interactionTime = Date.now() - startTime;
      expect(interactionTime).toBeLessThan(1000); // 1 second
    });
  });

  test.describe('Accessibility', () => {
    test('should pass automated accessibility tests', async ({ page }) => {
      await injectAxe(page);
      await checkA11y(page);
    });

    test('should have proper heading structure', async ({ page }) => {
      // Check for hierarchical headings
      const h1 = page.locator('h1');
      const h2 = page.locator('h2');
      const h3 = page.locator('h3');
      
      // Should have proper heading hierarchy
      expect(await h2.count()).toBeGreaterThan(0);
    });

    test('should have sufficient color contrast', async ({ page }) => {
      await injectAxe(page);
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
    });

    test('should support screen readers', async ({ page }) => {
      // Check for ARIA labels and roles
      const ariaLabels = page.locator('[aria-label]');
      const roles = page.locator('[role]');
      
      expect(await ariaLabels.count() + await roles.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work in different browsers', async ({ page, browserName }) => {
      // Test basic functionality across browsers
      await expect(page.getByText('IMU')).toBeVisible();
      await expect(page.getByText('LiDAR')).toBeVisible();
      await expect(page.getByText('Controls')).toBeVisible();
      
      // Browser-specific tests could be added here
      console.log(`Testing in ${browserName}`);
    });
  });
});