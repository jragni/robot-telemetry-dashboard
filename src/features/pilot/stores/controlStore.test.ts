import { describe, expect, it, beforeEach } from 'vitest';

import { createControlStore } from './controlStore';

describe('controlStore', () => {
  describe('factory pattern', () => {
    it('createControlStore() returns a unique store per robotId', () => {
      const storeA = createControlStore('robot-1');
      const storeB = createControlStore('robot-2');
      expect(storeA).not.toBe(storeB);
    });

    it('same robotId returns different store instances (not cached singleton)', () => {
      const storeA = createControlStore('robot-1');
      const storeB = createControlStore('robot-1');
      // Each call creates a fresh store — no cross-contamination
      expect(storeA).not.toBe(storeB);
    });
  });

  describe('initial state', () => {
    let store: ReturnType<typeof createControlStore>;

    beforeEach(() => {
      store = createControlStore('robot-1');
    });

    it('linearVelocity defaults to 0.5', () => {
      expect(store.getState().linearVelocity).toBe(0.5);
    });

    it('angularVelocity defaults to 0.5', () => {
      expect(store.getState().angularVelocity).toBe(0.5);
    });

    it('eStopActive defaults to false', () => {
      expect(store.getState().eStopActive).toBe(false);
    });

    it('activeDirection defaults to null', () => {
      expect(store.getState().activeDirection).toBeNull();
    });

    it('selectedTopic defaults to /cmd_vel', () => {
      expect(store.getState().selectedTopic).toBe('/cmd_vel');
    });
  });

  describe('velocity state', () => {
    let store: ReturnType<typeof createControlStore>;

    beforeEach(() => {
      store = createControlStore('robot-1');
    });

    it('setLinearVelocity() updates linearVelocity', () => {
      store.getState().setLinearVelocity(1.2);
      expect(store.getState().linearVelocity).toBe(1.2);
    });

    it('setAngularVelocity() updates angularVelocity', () => {
      store.getState().setAngularVelocity(0.8);
      expect(store.getState().angularVelocity).toBe(0.8);
    });

    it('setLinearVelocity() clamps below 0.1 to 0.1', () => {
      store.getState().setLinearVelocity(0);
      expect(store.getState().linearVelocity).toBe(0.1);
    });

    it('setAngularVelocity() clamps below 0.1 to 0.1', () => {
      store.getState().setAngularVelocity(0);
      expect(store.getState().angularVelocity).toBe(0.1);
    });
  });

  describe('e-stop state', () => {
    let store: ReturnType<typeof createControlStore>;

    beforeEach(() => {
      store = createControlStore('robot-1');
    });

    it('activateEStop() sets eStopActive to true', () => {
      store.getState().activateEStop();
      expect(store.getState().eStopActive).toBe(true);
    });

    it('releaseEStop() sets eStopActive to false', () => {
      store.getState().activateEStop();
      store.getState().releaseEStop();
      expect(store.getState().eStopActive).toBe(false);
    });

    it('activateEStop() clears activeDirection', () => {
      store.getState().setDirection('forward');
      store.getState().activateEStop();
      expect(store.getState().activeDirection).toBeNull();
    });
  });

  describe('direction state', () => {
    let store: ReturnType<typeof createControlStore>;

    beforeEach(() => {
      store = createControlStore('robot-1');
    });

    it('setDirection() updates activeDirection', () => {
      store.getState().setDirection('forward');
      expect(store.getState().activeDirection).toBe('forward');
    });

    it('setDirection(null) clears activeDirection', () => {
      store.getState().setDirection('forward');
      store.getState().setDirection(null);
      expect(store.getState().activeDirection).toBeNull();
    });

    it('setDirection() is ignored while e-stop is active', () => {
      store.getState().activateEStop();
      store.getState().setDirection('forward');
      expect(store.getState().activeDirection).toBeNull();
    });
  });

  describe('topic state', () => {
    let store: ReturnType<typeof createControlStore>;

    beforeEach(() => {
      store = createControlStore('robot-1');
    });

    it('setTopic() updates selectedTopic', () => {
      store.getState().setTopic('/my_cmd_vel');
      expect(store.getState().selectedTopic).toBe('/my_cmd_vel');
    });
  });
});
