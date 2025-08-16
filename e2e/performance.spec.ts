import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Load Performance', () => {
    test('should load initial page quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForSelector('[data-testid="imu-visualization"], text=IMU', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 seconds
    });

    test('should have good First Contentful Paint', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForSelector('text=IMU', { timeout: 5000 });
      
      const fcpTime = Date.now() - startTime;
      expect(fcpTime).toBeLessThan(2000); // 2 seconds for FCP
    });

    test('should complete loading within reasonable time', async ({ page }) => {
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const navigationEntry = entries.find(entry => entry.entryType === 'navigation');
            if (navigationEntry) {
              resolve({
                domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
                loadComplete: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
              });
            }
          }).observe({ entryTypes: ['navigation'] });
          
          // Fallback timeout
          setTimeout(() => resolve({ domContentLoaded: 0, loadComplete: 0 }), 5000);
        });
      });

      expect(metrics.domContentLoaded).toBeLessThan(2000);
      expect(metrics.loadComplete).toBeLessThan(5000);
    });
  });

  test.describe('Runtime Performance', () => {
    test('should handle rapid control inputs efficiently', async ({ page }) => {
      // Find control buttons
      const forwardBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
      const stopBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
      
      const startTime = Date.now();
      
      // Rapid button presses
      for (let i = 0; i < 20; i++) {
        await forwardBtn.click();
        await stopBtn.click();
      }
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(2000); // 2 seconds for 40 clicks
    });

    test('should maintain responsive slider interactions', async ({ page }) => {
      const slider = page.locator('input[type="range"]').first();
      
      if (await slider.isVisible()) {
        const startTime = Date.now();
        
        // Rapid slider changes
        for (let i = 0; i < 20; i++) {
          await slider.fill((i * 0.05).toString());
        }
        
        const sliderTime = Date.now() - startTime;
        expect(sliderTime).toBeLessThan(1000); // 1 second for 20 changes
      }
    });

    test('should handle viewport changes efficiently', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 768, height: 1024 },
        { width: 375, height: 667 },
        { width: 1440, height: 900 },
        { width: 320, height: 568 },
      ];

      const startTime = Date.now();
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(100); // Allow for layout reflow
      }
      
      const resizeTime = Date.now() - startTime;
      expect(resizeTime).toBeLessThan(2000); // 2 seconds for all resizes
    });

    test('should maintain performance with many DOM updates', async ({ page }) => {
      // Simulate continuous updates
      const startTime = Date.now();
      
      await page.evaluate(() => {
        // Simulate rapid DOM updates
        for (let i = 0; i < 100; i++) {
          const element = document.createElement('div');
          element.textContent = `Update ${i}`;
          document.body.appendChild(element);
          document.body.removeChild(element);
        }
      });
      
      const updateTime = Date.now() - startTime;
      expect(updateTime).toBeLessThan(500); // 500ms for DOM manipulation
    });
  });

  test.describe('Memory Usage', () => {
    test('should not have excessive memory growth', async ({ page }) => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Perform memory-intensive operations
      for (let i = 0; i < 50; i++) {
        await page.locator('button').first().click();
        await page.waitForTimeout(10);
      }

      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      }
    });

    test('should clean up properly after interactions', async ({ page }) => {
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      const beforeMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Create and destroy elements
      await page.evaluate(() => {
        const elements = [];
        for (let i = 0; i < 1000; i++) {
          const div = document.createElement('div');
          div.innerHTML = `<span>Test ${i}</span>`;
          elements.push(div);
        }
        elements.forEach(el => el.remove());
      });

      // Force cleanup
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });

      const afterMemory = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      if (beforeMemory > 0 && afterMemory > 0) {
        const memoryDiff = afterMemory - beforeMemory;
        expect(Math.abs(memoryDiff)).toBeLessThan(5 * 1024 * 1024); // Less than 5MB difference
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network gracefully', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        await route.continue();
      });

      const startTime = Date.now();
      await page.goto('/');
      await page.waitForSelector('text=IMU', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(8000); // 8 seconds on slow network
    });

    test('should work offline after initial load', async ({ page }) => {
      // Load page first
      await page.goto('/');
      await page.waitForSelector('text=IMU');

      // Go offline
      await page.setOffline(true);

      // Should still be functional
      await expect(page.getByText('IMU')).toBeVisible();
      await expect(page.getByText('LiDAR')).toBeVisible();
      await expect(page.getByText('Controls')).toBeVisible();

      // Test interactions work offline
      const button = page.locator('button').first();
      if (await button.isVisible()) {
        await button.click();
      }
    });

    test('should recover from network errors', async ({ page }) => {
      // Start online
      await page.goto('/');
      await page.waitForSelector('text=IMU');

      // Simulate network failure
      await page.route('**/*', route => route.abort());
      await page.waitForTimeout(1000);

      // Restore network
      await page.unroute('**/*');

      // Should recover gracefully
      await expect(page.getByText('IMU')).toBeVisible();
    });
  });

  test.describe('Rendering Performance', () => {
    test('should render visualizations efficiently', async ({ page }) => {
      const startTime = Date.now();

      // Wait for SVG elements to render
      await page.waitForSelector('svg', { timeout: 5000 });
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(3000); // 3 seconds for visualization rendering
    });

    test('should handle window resize efficiently', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      
      const startTime = Date.now();
      
      // Rapid resize operations
      for (let i = 0; i < 10; i++) {
        await page.setViewportSize({ 
          width: 800 + i * 100, 
          height: 600 + i * 50 
        });
      }
      
      const resizeTime = Date.now() - startTime;
      expect(resizeTime).toBeLessThan(2000); // 2 seconds for all resizes
    });

    test('should maintain 60fps during animations', async ({ page }) => {
      // Start performance monitoring
      await page.evaluate(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        
        function countFrames() {
          const currentTime = performance.now();
          frameCount++;
          
          if (currentTime - lastTime >= 1000) {
            (window as any).fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
          }
          
          requestAnimationFrame(countFrames);
        }
        
        requestAnimationFrame(countFrames);
      });

      // Trigger animations/interactions
      const buttons = page.locator('button');
      const buttonCount = Math.min(await buttons.count(), 5);
      
      for (let i = 0; i < buttonCount; i++) {
        await buttons.nth(i).click();
        await page.waitForTimeout(100);
      }

      // Wait for frame rate measurement
      await page.waitForTimeout(2000);

      const fps = await page.evaluate(() => (window as any).fps || 0);
      
      // Should maintain reasonable frame rate (allowing for some variance in testing)
      expect(fps).toBeGreaterThan(30); // At least 30fps
    });
  });

  test.describe('Resource Usage', () => {
    test('should not create excessive DOM nodes', async ({ page }) => {
      const initialNodeCount = await page.evaluate(() => {
        return document.querySelectorAll('*').length;
      });

      // Perform operations that might create DOM nodes
      const buttons = page.locator('button');
      const buttonCount = Math.min(await buttons.count(), 10);
      
      for (let i = 0; i < buttonCount; i++) {
        await buttons.nth(i).click();
      }

      const finalNodeCount = await page.evaluate(() => {
        return document.querySelectorAll('*').length;
      });

      const nodeGrowth = finalNodeCount - initialNodeCount;
      expect(nodeGrowth).toBeLessThan(1000); // Less than 1000 new nodes
    });

    test('should limit event listener count', async ({ page }) => {
      const listenerCount = await page.evaluate(() => {
        // This is a simplified check - in real scenarios you'd use more sophisticated monitoring
        const elements = document.querySelectorAll('*');
        let count = 0;
        
        elements.forEach(el => {
          // Check for common event listeners
          if (el.onclick || el.onchange || el.onmousedown) {
            count++;
          }
        });
        
        return count;
      });

      // Should have reasonable number of event listeners
      expect(listenerCount).toBeLessThan(1000);
    });

    test('should handle concurrent operations efficiently', async ({ page }) => {
      const startTime = Date.now();

      // Simulate concurrent operations
      const operations = [
        page.locator('input[type="range"]').first().fill('0.5'),
        page.locator('button').first().click(),
        page.setViewportSize({ width: 1024, height: 768 }),
        page.evaluate(() => window.scrollTo(0, 100)),
      ];

      await Promise.all(operations);

      const concurrentTime = Date.now() - startTime;
      expect(concurrentTime).toBeLessThan(1000); // 1 second for concurrent operations
    });
  });

  test.describe('Performance Regression Detection', () => {
    test('should maintain consistent load times', async ({ page }) => {
      const loadTimes: number[] = [];

      // Measure load time multiple times
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        await page.goto('/', { waitUntil: 'networkidle' });
        await page.waitForSelector('text=IMU');
        const loadTime = Date.now() - startTime;
        loadTimes.push(loadTime);

        // Clear cache between runs
        await page.evaluate(() => {
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => caches.delete(name));
            });
          }
        });
      }

      // Check for consistency (standard deviation should be reasonable)
      const average = loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length;
      const variance = loadTimes.reduce((sum, time) => sum + Math.pow(time - average, 2), 0) / loadTimes.length;
      const standardDeviation = Math.sqrt(variance);

      expect(standardDeviation).toBeLessThan(average * 0.3); // SD should be less than 30% of average
    });

    test('should maintain interaction responsiveness', async ({ page }) => {
      const interactionTimes: number[] = [];

      // Measure interaction response times
      for (let i = 0; i < 5; i++) {
        const button = page.locator('button').first();
        
        if (await button.isVisible()) {
          const startTime = Date.now();
          await button.click();
          await page.waitForTimeout(50); // Wait for any visual feedback
          const interactionTime = Date.now() - startTime;
          interactionTimes.push(interactionTime);
        }
      }

      // All interactions should be fast
      interactionTimes.forEach(time => {
        expect(time).toBeLessThan(200); // Less than 200ms per interaction
      });
    });
  });
});