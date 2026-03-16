/// <reference types="vite/client" />

// Vite defines `this.ROSLIB` as `window.ROSLIB` at build time to fix roslib's
// CommonJS module pattern in ES module scope. This declaration ensures TypeScript
// recognises the global so type-checked code that references window.ROSLIB compiles
// without error.
interface Window {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  ROSLIB: typeof import('roslib');
}
