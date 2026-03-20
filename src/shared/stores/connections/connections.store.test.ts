import { describe, expect, it, beforeEach } from 'vitest';

import { useConnectionsStore } from './connections.store';

describe('connections.store', () => {
  beforeEach(() => {
    // Reset store state between tests
    useConnectionsStore.setState({
      robots: [],
      activeRobotId: null,
    });
  });

  it('starts with empty robot list', () => {
    const state = useConnectionsStore.getState();
    expect(state.robots).toEqual([]);
    expect(state.activeRobotId).toBeNull();
  });

  it('addRobot() adds a robot to the list', () => {
    const { addRobot } = useConnectionsStore.getState();
    addRobot({
      id: 'robot-1',
      name: 'Robot Alpha',
      url: 'ws://localhost:9090',
    });

    const state = useConnectionsStore.getState();
    expect(state.robots).toHaveLength(1);
    expect(state.robots[0]).toEqual({
      id: 'robot-1',
      name: 'Robot Alpha',
      url: 'ws://localhost:9090',
    });
  });

  it('addRobot() does not add duplicate robot ids', () => {
    const { addRobot } = useConnectionsStore.getState();
    addRobot({
      id: 'robot-1',
      name: 'Robot Alpha',
      url: 'ws://localhost:9090',
    });
    addRobot({
      id: 'robot-1',
      name: 'Robot Alpha 2',
      url: 'ws://localhost:9091',
    });

    const state = useConnectionsStore.getState();
    expect(state.robots).toHaveLength(1);
  });

  it('removeRobot() removes a robot from the list', () => {
    const { addRobot } = useConnectionsStore.getState();
    addRobot({
      id: 'robot-1',
      name: 'Robot Alpha',
      url: 'ws://localhost:9090',
    });
    addRobot({ id: 'robot-2', name: 'Robot Beta', url: 'ws://localhost:9091' });

    const { removeRobot } = useConnectionsStore.getState();
    removeRobot('robot-1');

    const state = useConnectionsStore.getState();
    expect(state.robots).toHaveLength(1);
    expect(state.robots[0].id).toBe('robot-2');
  });

  it('removeRobot() clears activeRobotId if removed robot was active', () => {
    const { addRobot, setActiveRobot } = useConnectionsStore.getState();
    addRobot({
      id: 'robot-1',
      name: 'Robot Alpha',
      url: 'ws://localhost:9090',
    });
    setActiveRobot('robot-1');

    expect(useConnectionsStore.getState().activeRobotId).toBe('robot-1');

    const { removeRobot } = useConnectionsStore.getState();
    removeRobot('robot-1');

    expect(useConnectionsStore.getState().activeRobotId).toBeNull();
  });

  it('setActiveRobot() changes the active robot', () => {
    const { addRobot, setActiveRobot } = useConnectionsStore.getState();
    addRobot({
      id: 'robot-1',
      name: 'Robot Alpha',
      url: 'ws://localhost:9090',
    });
    addRobot({ id: 'robot-2', name: 'Robot Beta', url: 'ws://localhost:9091' });

    setActiveRobot('robot-2');
    expect(useConnectionsStore.getState().activeRobotId).toBe('robot-2');

    setActiveRobot('robot-1');
    expect(useConnectionsStore.getState().activeRobotId).toBe('robot-1');
  });

  it('setActiveRobot(null) deselects the active robot', () => {
    const { addRobot, setActiveRobot } = useConnectionsStore.getState();
    addRobot({
      id: 'robot-1',
      name: 'Robot Alpha',
      url: 'ws://localhost:9090',
    });
    setActiveRobot('robot-1');
    setActiveRobot(null);

    expect(useConnectionsStore.getState().activeRobotId).toBeNull();
  });
});
