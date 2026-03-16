import { describe, it, expect, beforeEach } from 'vitest';

import { useConnectionsStore } from './connections.store';

import type { RobotConnection } from '@/types/connection.types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialState = {
  robots: [] as RobotConnection[],
  activeRobotId: null as string | null,
};

const robotInput: Omit<RobotConnection, 'id' | 'createdAt'> = {
  name: 'Robot Alpha',
  baseUrl: 'ws://192.168.1.10:9090',
};

const secondRobotInput: Omit<RobotConnection, 'id' | 'createdAt'> = {
  name: 'Robot Beta',
  baseUrl: 'ws://192.168.1.11:9090',
};

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useConnectionsStore', () => {
  beforeEach(() => {
    useConnectionsStore.setState(initialState);
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // addRobot
  // -------------------------------------------------------------------------

  describe('addRobot', () => {
    it('creates a robot with a generated id', () => {
      const id = useConnectionsStore.getState().addRobot(robotInput);

      const { robots } = useConnectionsStore.getState();
      expect(robots).toHaveLength(1);
      expect(robots[0].id).toBe(id);
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('creates a robot with a numeric createdAt timestamp', () => {
      const before = Date.now();
      useConnectionsStore.getState().addRobot(robotInput);
      const after = Date.now();

      const { robots } = useConnectionsStore.getState();
      expect(robots[0].createdAt).toBeGreaterThanOrEqual(before);
      expect(robots[0].createdAt).toBeLessThanOrEqual(after);
    });

    it('persists the supplied name and baseUrl', () => {
      useConnectionsStore.getState().addRobot(robotInput);

      const { robots } = useConnectionsStore.getState();
      expect(robots[0].name).toBe(robotInput.name);
      expect(robots[0].baseUrl).toBe(robotInput.baseUrl);
    });

    it('auto-selects the robot as active when it is the first one added', () => {
      const id = useConnectionsStore.getState().addRobot(robotInput);

      expect(useConnectionsStore.getState().activeRobotId).toBe(id);
    });

    it('does NOT change activeRobotId when a second robot is added', () => {
      const firstId = useConnectionsStore.getState().addRobot(robotInput);
      useConnectionsStore.getState().addRobot(secondRobotInput);

      expect(useConnectionsStore.getState().activeRobotId).toBe(firstId);
    });

    it('generates unique ids for each robot', () => {
      const id1 = useConnectionsStore.getState().addRobot(robotInput);
      const id2 = useConnectionsStore.getState().addRobot(secondRobotInput);

      expect(id1).not.toBe(id2);
    });
  });

  // -------------------------------------------------------------------------
  // removeRobot
  // -------------------------------------------------------------------------

  describe('removeRobot', () => {
    it('removes the robot from the list', () => {
      const id = useConnectionsStore.getState().addRobot(robotInput);
      useConnectionsStore.getState().removeRobot(id);

      expect(useConnectionsStore.getState().robots).toHaveLength(0);
    });

    it('leaves other robots intact', () => {
      const id1 = useConnectionsStore.getState().addRobot(robotInput);
      const id2 = useConnectionsStore.getState().addRobot(secondRobotInput);

      useConnectionsStore.getState().removeRobot(id1);

      const { robots } = useConnectionsStore.getState();
      expect(robots).toHaveLength(1);
      expect(robots[0].id).toBe(id2);
    });

    it('clears activeRobotId when the active robot is removed', () => {
      const id = useConnectionsStore.getState().addRobot(robotInput);
      expect(useConnectionsStore.getState().activeRobotId).toBe(id);

      useConnectionsStore.getState().removeRobot(id);

      expect(useConnectionsStore.getState().activeRobotId).toBeNull();
    });

    it('does NOT clear activeRobotId when a non-active robot is removed', () => {
      const id1 = useConnectionsStore.getState().addRobot(robotInput);
      const id2 = useConnectionsStore.getState().addRobot(secondRobotInput);

      useConnectionsStore.getState().removeRobot(id2);

      expect(useConnectionsStore.getState().activeRobotId).toBe(id1);
    });

    it('is a no-op for an unknown id', () => {
      useConnectionsStore.getState().addRobot(robotInput);
      useConnectionsStore.getState().removeRobot('non-existent-id');

      expect(useConnectionsStore.getState().robots).toHaveLength(1);
    });
  });

  // -------------------------------------------------------------------------
  // setActiveRobot
  // -------------------------------------------------------------------------

  describe('setActiveRobot', () => {
    it('sets activeRobotId to the provided id', () => {
      const id1 = useConnectionsStore.getState().addRobot(robotInput);
      const id2 = useConnectionsStore.getState().addRobot(secondRobotInput);

      useConnectionsStore.getState().setActiveRobot(id2);

      expect(useConnectionsStore.getState().activeRobotId).toBe(id2);
      void id1; // used above to add a second robot
    });

    it('accepts null to deselect the active robot', () => {
      useConnectionsStore.getState().addRobot(robotInput);
      useConnectionsStore.getState().setActiveRobot(null);

      expect(useConnectionsStore.getState().activeRobotId).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // getActiveRobot
  // -------------------------------------------------------------------------

  describe('getActiveRobot', () => {
    it('returns the robot whose id matches activeRobotId', () => {
      const id = useConnectionsStore.getState().addRobot(robotInput);

      const active = useConnectionsStore.getState().getActiveRobot();

      expect(active).toBeDefined();
      expect(active?.id).toBe(id);
      expect(active?.name).toBe(robotInput.name);
    });

    it('returns undefined when activeRobotId is null', () => {
      useConnectionsStore.getState().addRobot(robotInput);
      useConnectionsStore.getState().setActiveRobot(null);

      expect(useConnectionsStore.getState().getActiveRobot()).toBeUndefined();
    });

    it('returns undefined when no robots have been added', () => {
      expect(useConnectionsStore.getState().getActiveRobot()).toBeUndefined();
    });
  });
});
