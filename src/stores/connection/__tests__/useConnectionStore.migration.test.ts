import { describe, it, expect } from 'vitest';
import { persistedStateSchema } from '../useConnectionStore.helpers';

describe('persistedStateSchema (migration validation)', () => {
  it('parses valid persisted state', () => {
    const input = {
      robots: {
        'atlas-01': {
          id: 'atlas-01',
          name: 'Atlas 01',
          url: 'ws://localhost:9090',
          status: 'disconnected',
          lastSeen: null,
          lastError: null,
          color: 'blue',
          selectedTopics: { camera: '/camera/image_raw' },
        },
      },
    };
    const result = persistedStateSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('parses state with missing optional fields', () => {
    const input = {
      robots: {
        'atlas-01': {
          id: 'atlas-01',
          name: 'Atlas 01',
          url: 'ws://localhost:9090',
        },
      },
    };
    const result = persistedStateSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.robots['atlas-01']?.color).toBeUndefined();
      expect(result.data.robots['atlas-01']?.selectedTopics).toBeUndefined();
    }
  });

  it('rejects state with missing required fields', () => {
    const input = {
      robots: {
        'atlas-01': {
          id: 'atlas-01',
          // name and url missing
        },
      },
    };
    const result = persistedStateSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects null persisted state', () => {
    const result = persistedStateSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it('rejects state without robots key', () => {
    const result = persistedStateSchema.safeParse({ other: 'data' });
    expect(result.success).toBe(false);
  });

  it('rejects state with non-object robots', () => {
    const result = persistedStateSchema.safeParse({ robots: 'not-an-object' });
    expect(result.success).toBe(false);
  });

  it('handles multiple robots', () => {
    const input = {
      robots: {
        'atlas-01': { id: 'atlas-01', name: 'Atlas 01', url: 'ws://a:9090' },
        'bot-02': { id: 'bot-02', name: 'Bot 02', url: 'ws://b:9090', color: 'cyan' },
      },
    };
    const result = persistedStateSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data.robots)).toHaveLength(2);
    }
  });
});
