import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Visual Gate — Automated assertions that run as part of the quality gate
 * for EVERY phase (logic, visual, and integration).
 *
 * These are hard test failures, not AI scores. The quality gate cannot pass
 * if any assertion fails.
 *
 * Routes are loaded from e2e/routes.json — update this file when routes change.
 * Screenshots are saved to .planning/screenshots/ for human review.
 */

// --- Route manifest (phase-aware) ---
// Update e2e/routes.json when adding/changing routes.
// Each entry: { path, name, slug, landmarks[] }
// landmarks = data-testid values that MUST exist on that route.

interface RouteEntry {
  path: string;
  name: string;
  slug: string;
  landmarks: string[];
}

const ROUTES_FILE = path.resolve(__dirname, 'routes.json');
const ROUTES: RouteEntry[] = fs.existsSync(ROUTES_FILE)
  ? JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf-8'))
  : [{ path: '/', name: 'App Root', slug: 'root', landmarks: [] }];

const SCREENSHOT_DIR = path.resolve(__dirname, '../.planning/screenshots');

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
];

const PLACEHOLDER_PATTERNS = [
  'coming in phase',
  'placeholder',
  'todo:',
  'not yet implemented',
  'lorem ipsum',
  'stub',
  'temporary',
  'work in progress',
  'sample data',
  'will be replaced',
];

const HARDCODED_COLOR_SELECTORS = [
  '[class*="slate-"]',
  '[class*="gray-"]',
  '[class*="zinc-"]',
  '[class*="neutral-"]',
  '[class*="stone-"]',
];

test.describe('Visual Gate — Phase Quality Assertions', () => {
  // --- 1. Dark theme active (ALL routes) ---
  test.describe('1. Dark theme active', () => {
    for (const route of ROUTES) {
      test(`${route.name} (${route.path}) has dark theme`, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');
        const html = page.locator('html');

        const hasDarkClass = await html.evaluate((el) => el.classList.contains('dark'));
        const dataTheme = await html.getAttribute('data-theme');
        const hasDarkTheme = dataTheme?.toLowerCase().includes('dark') ?? false;

        expect(
          hasDarkClass || hasDarkTheme,
          `Route ${route.path}: html element missing class="dark" or data-theme="dark"`
        ).toBe(true);
      });
    }
  });

  // --- 2. No blank pages (semantic landmark checks) ---
  test.describe('2. No blank pages', () => {
    for (const route of ROUTES) {
      test(`${route.name} (${route.path}) renders meaningful content`, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        // Basic element count (raised threshold)
        const visibleElements = await page.locator('body *:visible').count();
        expect(
          visibleElements,
          `Route ${route.path} rendered only ${visibleElements} visible elements (minimum: 15)`
        ).toBeGreaterThanOrEqual(15);

        // Semantic landmark checks — route-specific data-testid elements
        for (const landmark of route.landmarks) {
          const el = page.locator(`[data-testid="${landmark}"]`);
          await expect(
            el,
            `Route ${route.path} missing required landmark: data-testid="${landmark}"`
          ).toBeVisible();
        }
      });
    }
  });

  // --- 3. No placeholder text ---
  test.describe('3. No placeholder text', () => {
    for (const route of ROUTES) {
      test(`${route.name} (${route.path}) has no placeholder text`, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.locator('body').innerText();
        const lowerText = bodyText.toLowerCase();

        for (const pattern of PLACEHOLDER_PATTERNS) {
          expect(
            lowerText,
            `Route ${route.path} contains placeholder text: "${pattern}"`
          ).not.toContain(pattern);
        }
      });
    }
  });

  // --- 4. No hardcoded Tailwind gray colors (all palettes) ---
  test.describe('4. No hardcoded Tailwind gray colors', () => {
    for (const route of ROUTES) {
      test(`${route.name} (${route.path}) uses design tokens`, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        for (const selector of HARDCODED_COLOR_SELECTORS) {
          const count = await page.locator(selector).count();
          expect(
            count,
            `Route ${route.path} has ${count} elements matching ${selector}. Use design tokens instead.`
          ).toBe(0);
        }
      });
    }
  });

  // --- 5. Screenshot capture for human review ---
  test.describe('5. Screenshot capture', () => {
    for (const route of ROUTES) {
      for (const viewport of VIEWPORTS) {
        test(`capture ${route.name} at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
          page,
        }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(route.path);
          await page.waitForLoadState('networkidle');

          await page.screenshot({
            path: path.join(
              SCREENSHOT_DIR,
              `${route.slug}-${viewport.width}x${viewport.height}.png`
            ),
            fullPage: false,
          });
        });
      }
    }
  });

  // --- 6. Background color is not white (ALL routes) ---
  test.describe('6. Background not white', () => {
    const WHITE_VALUES = [
      'rgb(255, 255, 255)',
      'rgba(255, 255, 255, 1)',
      'rgba(0, 0, 0, 0)',
    ];

    for (const route of ROUTES) {
      test(`${route.name} (${route.path}) has dark background`, async ({ page }) => {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        const bgColor = await page.locator('body').evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        expect(
          WHITE_VALUES.includes(bgColor),
          `Route ${route.path}: body background is white/transparent (${bgColor})`
        ).toBe(false);
      });
    }
  });

  // --- 7. No console errors ---
  test.describe('7. No console errors', () => {
    for (const route of ROUTES) {
      test(`${route.name} (${route.path}) has zero console errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (err) => errors.push(err.message));
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(msg.text());
        });

        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        expect(
          errors,
          `Route ${route.path} has ${errors.length} console error(s):\n${errors.join('\n')}`
        ).toHaveLength(0);
      });
    }
  });
});
