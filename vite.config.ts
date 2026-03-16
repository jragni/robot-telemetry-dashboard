import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const isTest = process.env.VITEST === 'true' || process.env.NODE_ENV === 'test';

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

  // Fix roslib's usage of 'this' in CommonJS modules.
  // roslib uses 'var ROSLIB = this.ROSLIB || {}' which fails in ES modules
  // where top-level 'this' is undefined at runtime.
  // Excluded during tests because jsdom is not available at define-processing time.
  ...(!isTest && {
    define: {
      'this.ROSLIB': 'window.ROSLIB',
    },
  }),

  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  optimizeDeps: {
    include: ['roslib'],
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/utils/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
});
