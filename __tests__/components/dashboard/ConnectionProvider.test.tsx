import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { render, screen } from '@/test-utils';
import ConnectionProvider, { useConnection } from '@/components/dashboard/ConnectionProvider';
import { mockROSLIB, setupRosConnectionMocks, cleanupRosConnectionMocks } from '@/test-utils';

// Mock roslib
vi.mock('roslib', () => ({ default: mockROSLIB }));

describe('ConnectionProvider', () => {
  beforeEach(() => {
    setupRosConnectionMocks();
  });

  afterEach(() => {
    cleanupRosConnectionMocks();
  });

  it('should render children', () => {
    render(
      <ConnectionProvider>
        <div data-testid="test-child">Test Child</div>
      </ConnectionProvider>
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('should provide connection context', () => {
    const TestComponent = () => {
      const context = useConnection();
      return (
        <div data-testid="context-data">
          {JSON.stringify({
            hasAddConnection: typeof context.addConnection === 'function',
            hasConnections: typeof context.connections === 'object',
            hasSelectedConnection: context.selectedConnection === null,
          })}
        </div>
      );
    };

    render(
      <ConnectionProvider>
        <TestComponent />
      </ConnectionProvider>
    );

    const contextData = JSON.parse(screen.getByTestId('context-data').textContent || '{}');
    expect(contextData.hasAddConnection).toBe(true);
    expect(contextData.hasConnections).toBe(true);
    expect(contextData.hasSelectedConnection).toBe(true);
  });

  it('should throw error when useConnection is used outside provider', () => {
    const TestComponent = () => {
      useConnection();
      return <div>Test</div>;
    };

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      'useConnection must be used in ConnectionContextProvider'
    );

    consoleSpy.mockRestore();
  });

  describe('connection management', () => {
    it('should add a connection successfully', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await act(async () => {
        await result.current.addConnection('test-id', 'Test Robot', 'ws://localhost:9090');
      });

      await waitFor(() => {
        expect(result.current.connections['test-id']).toBeDefined();
        expect(result.current.connections['test-id'].name).toBe('Test Robot');
        expect(result.current.connections['test-id'].status).toBe('connected');
      });
    });

    it('should handle connection timeout', async () => {
      // Mock timeout scenario
      mockROSLIB.Ros.mockImplementation(() => ({
        url: 'ws://localhost:9090',
        socket: { binaryType: 'arraybuffer' },
        on: vi.fn(),
        close: vi.fn(),
        connect: vi.fn(),
        getTopics: vi.fn(),
      }));

      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.addConnection('timeout-id', 'Timeout Robot', 'ws://invalid:9090');
        });
      }).rejects.toThrow('Connection timeout');
    });

    it('should auto-select connection when only one exists', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await act(async () => {
        await result.current.addConnection('auto-select', 'Auto Select Robot', 'ws://localhost:9090');
      });

      await waitFor(() => {
        expect(result.current.selectedConnectionId).toBe('auto-select');
        expect(result.current.selectedConnection).toBeTruthy();
      });
    });

    it('should disconnect a connection', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await act(async () => {
        await result.current.addConnection('disconnect-test', 'Disconnect Robot', 'ws://localhost:9090');
      });

      await act(async () => {
        result.current.disconnect('disconnect-test');
      });

      await waitFor(() => {
        expect(result.current.connections['disconnect-test'].status).toBe('disconnected');
      });
    });

    it('should reconnect a connection', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await act(async () => {
        await result.current.addConnection('reconnect-test', 'Reconnect Robot', 'ws://localhost:9090');
      });

      await act(async () => {
        result.current.disconnect('reconnect-test');
      });

      await act(async () => {
        result.current.reconnect('reconnect-test');
      });

      await waitFor(() => {
        expect(result.current.connections['reconnect-test'].status).toBe('connected');
      });
    });

    it('should remove a connection', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await act(async () => {
        await result.current.addConnection('remove-test', 'Remove Robot', 'ws://localhost:9090');
      });

      await act(async () => {
        result.current.removeConnection('remove-test');
      });

      await waitFor(() => {
        expect(result.current.connections['remove-test']).toBeUndefined();
        expect(result.current.selectedConnectionId).toBe('');
      });
    });

    it('should set selected connection', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await act(async () => {
        await result.current.addConnection('select-test-1', 'Robot 1', 'ws://localhost:9090');
        await result.current.addConnection('select-test-2', 'Robot 2', 'ws://localhost:9091');
      });

      await act(async () => {
        result.current.setSelectedConnectionId('select-test-2');
      });

      await waitFor(() => {
        expect(result.current.selectedConnectionId).toBe('select-test-2');
        expect(result.current.selectedConnection?.name).toBe('Robot 2');
      });
    });

    it('should fetch topics after connection', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await act(async () => {
        await result.current.addConnection('topics-test', 'Topics Robot', 'ws://localhost:9090');
      });

      await waitFor(() => {
        const connection = result.current.connections['topics-test'];
        expect(connection.rosInstance.getTopics).toHaveBeenCalled();
      });
    });

    it('should handle connection errors gracefully', async () => {
      // Mock error scenario
      mockROSLIB.Ros.mockImplementation(() => ({
        url: 'ws://localhost:9090',
        socket: { binaryType: 'arraybuffer' },
        on: vi.fn().mockImplementation((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(new Error('Connection failed')), 50);
          }
        }),
        close: vi.fn(),
        connect: vi.fn(),
        getTopics: vi.fn(),
      }));

      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await expect(async () => {
        await act(async () => {
          await result.current.addConnection('error-test', 'Error Robot', 'ws://invalid:9090');
        });
      }).rejects.toThrow('Connection failed');
    });

    it('should optimize for control commands', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      await act(async () => {
        await result.current.addConnection('optimize-test', 'Optimize Robot', 'ws://localhost:9090');
      });

      await waitFor(() => {
        const connection = result.current.connections['optimize-test'];
        // Check that socket.binaryType was set for optimization
        expect(connection.rosInstance.socket.binaryType).toBe('arraybuffer');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined connection operations gracefully', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      // Try to operate on non-existent connection
      expect(() => result.current.disconnect('non-existent')).not.toThrow();
      expect(() => result.current.reconnect('non-existent')).not.toThrow();
      expect(() => result.current.removeConnection('non-existent')).not.toThrow();
    });

    it('should handle rapid connection/disconnection cycles', async () => {
      const { result } = renderHook(() => useConnection(), {
        wrapper: ConnectionProvider,
      });

      // Rapid add/remove cycles
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          await result.current.addConnection(`rapid-${i}`, `Robot ${i}`, `ws://localhost:909${i}`);
        });

        await act(async () => {
          result.current.removeConnection(`rapid-${i}`);
        });
      }

      expect(Object.keys(result.current.connections)).toHaveLength(0);
    });
  });
});