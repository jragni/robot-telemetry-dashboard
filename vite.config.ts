import path from 'path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

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
  define: {
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
});
