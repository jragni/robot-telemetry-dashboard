import '@testing-library/jest-dom/vitest';
import { configure as configureDom } from '@testing-library/dom';
import { act } from '@testing-library/react';
import * as vitest from 'vitest';

// @testing-library/dom's waitFor checks `typeof jest !== 'undefined'` to detect
// fake timers. Vitest with `globals: true` exposes `vi` but not `jest`.
// Assign it so waitFor can use jest.advanceTimersByTime() in fake timer mode.
(globalThis as Record<string, unknown>).jest = vitest.vi;

// Wrap waitFor's timer advancement in React's act() so state updates flush correctly.
configureDom({
  asyncUtilTimeout: 5000,
  unstable_advanceTimersWrapper: (cb) => act(cb),
});
