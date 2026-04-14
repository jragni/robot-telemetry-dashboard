import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.resolve(__dirname, 'PilotPage.tsx'),
  'utf-8',
);

describe('PilotPage memoization', () => {
  it('imports useMemo from react', () => {
    expect(source).toMatch(/import\s*\{[^}]*useMemo[^}]*\}\s*from\s*['"]react['"]/);
  });

  it('wraps pilotLidarPoints in useMemo with lidar.points dep', () => {
    expect(source).toContain('const pilotLidarPoints = useMemo(');
    expect(source).toMatch(/useMemo\(\s*\(\)\s*=>\s*\n?\s*lidar\.points\.map/);
    expect(source).toMatch(/\[lidar\.points\]/);
  });

  it('wraps telemetry object in useMemo with correct deps', () => {
    expect(source).toContain('const telemetry = useMemo(');
    // Verify key dependencies are listed
    const telemetryMemoBlock = source.slice(source.indexOf('const telemetry = useMemo('));
    expect(telemetryMemoBlock).toMatch(/\[.*connected.*imu\.roll.*imu\.pitch.*imu\.yaw.*pilotLidarPoints.*lidar\.rangeMax.*battery.*\]/s);
  });
});
