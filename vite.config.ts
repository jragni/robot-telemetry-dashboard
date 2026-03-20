/// <reference types="vitest/config" />
import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

const isTest = process.env.VITEST === 'true';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Base path for GitHub Pages deployment
  base: '/robot-telemetry-dashboard/',
  define: isTest
    ? {}
    : {
        // Fix roslib's usage of 'this' in CommonJS modules
        // roslib uses 'var ROSLIB = this.ROSLIB || {}' which fails in ES modules where 'this' is undefined
        'this.ROSLIB': 'window.ROSLIB',
      },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['roslib'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/utils/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    alias: {
      // In tests, redirect react-grid-layout/legacy to the main package so
      // vi.mock('react-grid-layout') intercepts both import paths.
      'react-grid-layout/legacy': 'react-grid-layout',
    },
  },
});
