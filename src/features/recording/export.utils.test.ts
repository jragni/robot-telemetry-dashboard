import { beforeEach, describe, expect, it, vi } from 'vitest';

import { exportSessionAsCsv, exportSessionAsJson } from './export.utils';
import type { RecordedMessage, RecordingSession } from './recording.types';

// ---------------------------------------------------------------------------
// jsdom does not implement Blob.text() — polyfill it for these tests.
// ---------------------------------------------------------------------------

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () =>
      reject(reader.error ?? new Error('FileReader failed'));
    reader.readAsText(blob);
  });
}

// ---------------------------------------------------------------------------
// Mock browser download APIs
// ---------------------------------------------------------------------------

const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();

vi.stubGlobal('URL', {
  createObjectURL: mockCreateObjectURL,
  revokeObjectURL: mockRevokeObjectURL,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSession(
  overrides: Partial<RecordingSession> = {}
): RecordingSession {
  return {
    id: 'session-001',
    name: 'Test Recording',
    robotId: 'robot-1',
    topics: ['/imu/data', '/scan'],
    startedAt: 1_700_000_000_000,
    endedAt: 1_700_000_060_000,
    messageCount: 3,
    sizeBytes: 1024,
    ...overrides,
  };
}

function makeMessages(): RecordedMessage[] {
  return [
    {
      sessionId: 'session-001',
      topicName: '/imu/data',
      messageType: 'sensor_msgs/Imu',
      timestamp: 0,
      data: { x: 1.0, y: 2.0, z: 3.0 },
    },
    {
      sessionId: 'session-001',
      topicName: '/scan',
      messageType: 'sensor_msgs/LaserScan',
      timestamp: 100,
      data: { range_min: 0.1, range_max: 10.0 },
    },
    {
      sessionId: 'session-001',
      topicName: '/imu/data',
      messageType: 'sensor_msgs/Imu',
      timestamp: 200,
      data: { x: 4.0, y: 5.0, z: 6.0 },
    },
  ];
}

// ---------------------------------------------------------------------------
// Capture the <a> tag created during download
// ---------------------------------------------------------------------------

let lastAnchor: HTMLAnchorElement | null = null;

const originalCreateElement = document.createElement.bind(document);

beforeEach(() => {
  vi.clearAllMocks();
  lastAnchor = null;
  mockCreateObjectURL.mockReturnValue('blob:mock-url');

  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    const el = originalCreateElement(tagName);
    if (tagName === 'a') {
      lastAnchor = el as HTMLAnchorElement;
      vi.spyOn(el, 'click').mockImplementation(mockClick);
    }
    return el;
  });
});

// ---------------------------------------------------------------------------
// exportSessionAsJson
// ---------------------------------------------------------------------------

describe('exportSessionAsJson()', () => {
  it('calls URL.createObjectURL with a Blob', () => {
    exportSessionAsJson(makeSession(), makeMessages());
    expect(mockCreateObjectURL).toHaveBeenCalledOnce();

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('creates a Blob with application/json MIME type', () => {
    exportSessionAsJson(makeSession(), makeMessages());

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toBe('application/json');
  });

  it('triggers a download click', () => {
    exportSessionAsJson(makeSession(), makeMessages());
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('sets the download filename based on session name', () => {
    exportSessionAsJson(makeSession({ name: 'My Recording' }), makeMessages());
    expect(lastAnchor?.download).toContain('My Recording');
    expect(lastAnchor?.download).toMatch(/\.json$/);
  });

  it('produces valid JSON containing session metadata', async () => {
    exportSessionAsJson(makeSession(), makeMessages());

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    const text = await readBlobAsText(blob);
    const parsed = JSON.parse(text) as Record<string, unknown>;

    expect(parsed.session).toBeDefined();
    expect((parsed.session as RecordingSession).id).toBe('session-001');
  });

  it('includes all messages in the JSON output', async () => {
    exportSessionAsJson(makeSession(), makeMessages());

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    const text = await readBlobAsText(blob);
    const parsed = JSON.parse(text) as { messages: RecordedMessage[] };

    expect(parsed.messages).toHaveLength(3);
  });

  it('calls URL.revokeObjectURL to clean up', () => {
    exportSessionAsJson(makeSession(), makeMessages());
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});

// ---------------------------------------------------------------------------
// exportSessionAsCsv
// ---------------------------------------------------------------------------

describe('exportSessionAsCsv()', () => {
  it('calls URL.createObjectURL with a Blob', () => {
    exportSessionAsCsv(makeSession(), makeMessages());
    expect(mockCreateObjectURL).toHaveBeenCalledOnce();

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
  });

  it('creates a Blob with text/csv MIME type', () => {
    exportSessionAsCsv(makeSession(), makeMessages());

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob.type).toBe('text/csv');
  });

  it('triggers a download click', () => {
    exportSessionAsCsv(makeSession(), makeMessages());
    expect(mockClick).toHaveBeenCalledOnce();
  });

  it('sets the download filename with .csv extension', () => {
    exportSessionAsCsv(makeSession({ name: 'Scan Log' }), makeMessages());
    expect(lastAnchor?.download).toContain('Scan Log');
    expect(lastAnchor?.download).toMatch(/\.csv$/);
  });

  it('CSV content has a header row with expected columns', async () => {
    exportSessionAsCsv(makeSession(), makeMessages());

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    const text = await readBlobAsText(blob);
    const lines = text.trim().split('\n');
    const header = lines[0] ?? '';

    expect(header).toContain('timestamp');
    expect(header).toContain('topic');
    expect(header).toContain('messageType');
    expect(header).toContain('data');
  });

  it('CSV has the correct number of data rows (one per message)', async () => {
    exportSessionAsCsv(makeSession(), makeMessages());

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    const text = await readBlobAsText(blob);
    // 1 header + 3 data rows
    const lines = text.trim().split('\n');
    expect(lines.length).toBe(4);
  });

  it('each data row contains the topic name', async () => {
    exportSessionAsCsv(makeSession(), makeMessages());

    const blob = mockCreateObjectURL.mock.calls[0]?.[0] as Blob;
    const text = await readBlobAsText(blob);
    const lines = text.trim().split('\n');
    const dataLines = lines.slice(1);

    const imuLines = dataLines.filter((l) => l.includes('/imu/data'));
    expect(imuLines.length).toBe(2);
  });

  it('calls URL.revokeObjectURL to clean up', () => {
    exportSessionAsCsv(makeSession(), makeMessages());
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
