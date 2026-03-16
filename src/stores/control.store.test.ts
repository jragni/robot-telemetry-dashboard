import { describe, it, expect, beforeEach } from 'vitest';

import { useControlStore, DEFAULT_CONTROL_STATE } from './control.store';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialState = {
  robotControls: {} as Record<
    string,
    {
      linearVelocity: number;
      angularVelocity: number;
      selectedTopic: string;
      isEStopActive: boolean;
    }
  >,
};

const ROBOT_ID = 'robot-001';
const OTHER_ROBOT_ID = 'robot-002';

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('useControlStore', () => {
  beforeEach(() => {
    useControlStore.setState(initialState);
    localStorage.clear();
  });

  // -------------------------------------------------------------------------
  // getControlState (defaults)
  // -------------------------------------------------------------------------

  describe('getControlState', () => {
    it('returns the default values for an unknown robot id', () => {
      const state = useControlStore.getState().getControlState('unknown-robot');

      expect(state.linearVelocity).toBe(DEFAULT_CONTROL_STATE.linearVelocity);
      expect(state.angularVelocity).toBe(DEFAULT_CONTROL_STATE.angularVelocity);
      expect(state.selectedTopic).toBe(DEFAULT_CONTROL_STATE.selectedTopic);
      expect(state.isEStopActive).toBe(DEFAULT_CONTROL_STATE.isEStopActive);
    });

    it('returns stored values for a known robot', () => {
      useControlStore.getState().setLinearVelocity(ROBOT_ID, 0.8);
      const state = useControlStore.getState().getControlState(ROBOT_ID);

      expect(state.linearVelocity).toBe(0.8);
    });
  });

  // -------------------------------------------------------------------------
  // setLinearVelocity
  // -------------------------------------------------------------------------

  describe('setLinearVelocity', () => {
    it('sets the linear velocity for the specified robot', () => {
      useControlStore.getState().setLinearVelocity(ROBOT_ID, 0.75);

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].linearVelocity
      ).toBe(0.75);
    });

    it('does not affect other robot entries', () => {
      useControlStore.getState().setLinearVelocity(ROBOT_ID, 0.75);
      useControlStore.getState().setLinearVelocity(OTHER_ROBOT_ID, 0.3);

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].linearVelocity
      ).toBe(0.75);
    });

    it('preserves other fields on an existing entry', () => {
      useControlStore.getState().setAngularVelocity(ROBOT_ID, 0.9);
      useControlStore.getState().setLinearVelocity(ROBOT_ID, 0.4);

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].angularVelocity
      ).toBe(0.9);
    });
  });

  // -------------------------------------------------------------------------
  // setAngularVelocity
  // -------------------------------------------------------------------------

  describe('setAngularVelocity', () => {
    it('sets the angular velocity for the specified robot', () => {
      useControlStore.getState().setAngularVelocity(ROBOT_ID, 0.6);

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].angularVelocity
      ).toBe(0.6);
    });

    it('preserves other fields on an existing entry', () => {
      useControlStore.getState().setLinearVelocity(ROBOT_ID, 0.8);
      useControlStore.getState().setAngularVelocity(ROBOT_ID, 0.2);

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].linearVelocity
      ).toBe(0.8);
    });
  });

  // -------------------------------------------------------------------------
  // setSelectedTopic
  // -------------------------------------------------------------------------

  describe('setSelectedTopic', () => {
    it('sets the selected topic for the specified robot', () => {
      useControlStore.getState().setSelectedTopic(ROBOT_ID, '/cmd_vel_safe');

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].selectedTopic
      ).toBe('/cmd_vel_safe');
    });

    it('preserves other fields on an existing entry', () => {
      useControlStore.getState().setLinearVelocity(ROBOT_ID, 0.5);
      useControlStore.getState().setSelectedTopic(ROBOT_ID, '/cmd_vel_safe');

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].linearVelocity
      ).toBe(0.5);
    });
  });

  // -------------------------------------------------------------------------
  // activateEStop
  // -------------------------------------------------------------------------

  describe('activateEStop', () => {
    it('sets isEStopActive to true for the specified robot', () => {
      useControlStore.getState().activateEStop(ROBOT_ID);

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].isEStopActive
      ).toBe(true);
    });

    it('does not affect other robots', () => {
      useControlStore.getState().activateEStop(ROBOT_ID);

      const other = useControlStore.getState().getControlState(OTHER_ROBOT_ID);
      expect(other.isEStopActive).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // deactivateEStop
  // -------------------------------------------------------------------------

  describe('deactivateEStop', () => {
    it('sets isEStopActive to false after it was true', () => {
      useControlStore.getState().activateEStop(ROBOT_ID);
      useControlStore.getState().deactivateEStop(ROBOT_ID);

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].isEStopActive
      ).toBe(false);
    });

    it('is a no-op when eStop was already inactive', () => {
      useControlStore.getState().deactivateEStop(ROBOT_ID);

      expect(
        useControlStore.getState().robotControls[ROBOT_ID].isEStopActive
      ).toBe(false);
    });
  });
});
