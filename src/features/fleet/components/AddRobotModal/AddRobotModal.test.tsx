import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { RECONNECT_MAX_ATTEMPTS } from '@/constants/reconnection';

const mockTestConnection = vi.fn<() => Promise<void>>();
const mockAddRobot = vi.fn();
const mockConnectRobot = vi.fn();

vi.mock('@/lib/rosbridge/ConnectionManager', () => ({
  testConnection: () => mockTestConnection(),
}));

vi.mock('@/stores/connection/useConnectionStore', () => ({
  useConnectionStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ addRobot: mockAddRobot, connectRobot: mockConnectRobot }),
}));

vi.mock('@/features/fleet/helpers', () => ({
  normalizeRosbridgeUrl: (url: string) => url || null,
}));

vi.mock('@/features/fleet/schemas', () => ({
  addRobotSchema: {
    safeParse: (data: { name: string; url: string }) => {
      if (data.name && data.url) return { data, success: true };
      return {
        error: { issues: [{ message: 'Required', path: ['name'] }] },
        success: false,
      };
    },
  },
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} />,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('./components/FieldError', () => ({
  FieldError: () => null,
}));

vi.mock('./components/MobileHeader', () => ({
  MobileHeader: () => null,
}));

const { AddRobotModal } = await import('./AddRobotModal');

function noop() { /* intentional no-op */ }

function getForm(): HTMLFormElement {
  const form = document.querySelector('form');
  if (!form) throw new Error('Form not found');
  return form;
}

describe('AddRobotModal retry display', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddRobot.mockReturnValue('robot-1');
    mockConnectRobot.mockResolvedValue(undefined);
  });

  function openAndFillForm() {
    render(<AddRobotModal />);
    const nameInput = screen.getByPlaceholderText('e.g., Atlas-01');
    const urlInput = screen.getByPlaceholderText(
      'e.g., 192.168.1.100 or wss://robot.example.com',
    );
    fireEvent.change(nameInput, { target: { value: 'TestBot' } });
    fireEvent.change(urlInput, { target: { value: 'ws://192.168.1.100:9090' } });
  }

  it('shows attempt 1 during first connection attempt', async () => {
    let resolveConnection: () => void = noop;
    mockTestConnection.mockImplementation(
      () => new Promise<void>((resolve) => { resolveConnection = resolve; }),
    );

    openAndFillForm();
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(
        screen.getByText(`Connecting... (attempt 1/${String(RECONNECT_MAX_ATTEMPTS)})`),
      ).toBeInTheDocument();
    });

    resolveConnection();
  });

  it('shows attempt 2 after first attempt fails', async () => {
    let callCount = 0;
    mockTestConnection.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error('timeout'));
      return new Promise<void>(noop);
    });

    openAndFillForm();
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(
        screen.getByText(`Connecting... (attempt 2/${String(RECONNECT_MAX_ATTEMPTS)})`),
      ).toBeInTheDocument();
    });
  });

  it('shows failure message after all attempts fail', async () => {
    mockTestConnection.mockRejectedValue(new Error('timeout'));

    openAndFillForm();
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(
        screen.getByText(`Failed after ${String(RECONNECT_MAX_ATTEMPTS)} attempts`),
      ).toBeInTheDocument();
    });
  });

  it('adds robot after successful retry on second attempt', async () => {
    let callCount = 0;
    mockTestConnection.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error('timeout'));
      return Promise.resolve();
    });

    openAndFillForm();
    fireEvent.submit(getForm());

    await waitFor(() => {
      expect(mockAddRobot).toHaveBeenCalledWith('TestBot', 'ws://192.168.1.100:9090');
    });
  });
});
