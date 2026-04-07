import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const source = fs.readFileSync(path.resolve(__dirname, 'ImuPanel.tsx'), 'utf-8');

describe('ImuPanel self-subscription', () => {
  it('imports useImuSubscription from shared hooks', () => {
    expect(source).toMatch(/import\s*\{[^}]*useImuSubscription[^}]*\}\s*from\s*['"]@\/hooks['"]/);
  });

  it('calls useImuSubscription with ros and topicName', () => {
    expect(source).toContain('useImuSubscription(ros, topicName)');
  });

  it('destructures ros, connected, and topicName from props', () => {
    expect(source).toMatch(/\{\s*connected\s*,\s*ros\s*,\s*topicName\s*\}/);
  });

  it('does not accept roll, pitch, or yaw as props', () => {
    const propsRegex = /export function ImuPanel\(\{([^}]+)\}/;
    const propsMatch = propsRegex.exec(source);
    expect(propsMatch).toBeTruthy();
    const propsText = propsMatch?.[1] ?? '';
    expect(propsText).not.toContain('roll');
    expect(propsText).not.toContain('pitch');
    expect(propsText).not.toContain('yaw');
  });

  it('derives roll, pitch, yaw from the hook return value', () => {
    expect(source).toMatch(/const\s*\{[^}]*pitch[^}]*roll[^}]*yaw[^}]*\}\s*=\s*useImuSubscription/);
  });
});
