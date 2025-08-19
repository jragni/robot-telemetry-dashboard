
export const formatMessage = (obj: unknown): string => {
  if (obj === null || obj === undefined) {
    return String(obj);
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    if (obj.length <= 10) {
      return `[${obj.map(item => formatMessage(item)).join(', ')}]`;
    }
    return `[${obj.slice(0, 3).map(item => formatMessage(item)).join(', ')}, ... ${obj.length - 3} more]`;
  }

  if (typeof obj === 'object') {
    try {
      const keys = Object.keys(obj as Record<string, unknown>);
      if (keys.length === 0) return '{}';

      // For simple objects, show key-value pairs
      if (keys.length <= 5) {
        const pairs = keys.map(key => {
          const value = formatMessage((obj as Record<string, unknown>)[key]);
          return `${key}: ${value.length > 50 ? `${value.substring(0, 47)  }...` : value}`;
        });
        return `{${pairs.join(', ')}}`;
      }

      // For complex objects, show formatted JSON
      return JSON.stringify(obj, null, 2);
    } catch {
      return '[Complex Object]';
    }
  }
  return String(obj);
};

// Fast formatter for sensor data - avoids expensive JSON.stringify
export const formatSensorMessage = (obj: unknown, messageType: string): string => {
  if (obj === null || obj === undefined) {
    return String(obj);
  }

  // For sensor data, show key metrics instead of full JSON
  if (messageType.includes('LaserScan') && typeof obj === 'object' && obj !== null) {
    const laserScan = obj as { ranges?: number[]; range_min?: number; range_max?: number };
    return `LaserScan: ${laserScan.ranges?.length || 0} points, range: ${laserScan.range_min?.toFixed(2) || 'N/A'}-${laserScan.range_max?.toFixed(2) || 'N/A'}m`;
  }

  if (messageType.includes('Imu') && typeof obj === 'object' && obj !== null) {
    const imu = obj as {
      orientation?: { x?: number; y?: number; z?: number; w?: number };
      linear_acceleration?: { x?: number; y?: number; z?: number };
    };
    const orient = imu.orientation;
    const accel = imu.linear_acceleration;
    return `IMU: orientation(${orient?.x?.toFixed(2) || 0}, ${orient?.y?.toFixed(2) || 0}, ${orient?.z?.toFixed(2) || 0}, ${orient?.w?.toFixed(2) || 0}), accel(${accel?.x?.toFixed(2) || 0}, ${accel?.y?.toFixed(2) || 0}, ${accel?.z?.toFixed(2) || 0})`;
  }

  if ((messageType.includes('Image') || messageType.includes('CompressedImage')) && typeof obj === 'object' && obj !== null) {
    const image = obj as { width?: number; height?: number; encoding?: string; data?: { length?: number } };
    return `Image: ${image.width || 'unknown'}x${image.height || 'unknown'}, encoding: ${image.encoding || 'unknown'}, ${image.data?.length || 0} bytes`;
  }

  if (messageType.includes('Twist') && typeof obj === 'object' && obj !== null) {
    const twist = obj as {
      linear?: { x?: number; y?: number; z?: number };
      angular?: { x?: number; y?: number; z?: number };
    };
    const linear = twist.linear;
    const angular = twist.angular;
    return `Twist: linear(${linear?.x?.toFixed(2) || 0}, ${linear?.y?.toFixed(2) || 0}, ${linear?.z?.toFixed(2) || 0}), angular(${angular?.x?.toFixed(2) || 0}, ${angular?.y?.toFixed(2) || 0}, ${angular?.z?.toFixed(2) || 0})`;
  }

  // For other message types, use lightweight formatting
  return formatMessage(obj);
};

export const formatFullMessage = (obj: unknown): string => {
  if (obj === null || obj === undefined) {
    return String(obj);
  }

  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return `[${obj.map(item => formatFullMessage(item)).join(', ')}]`;
  }

  if (typeof obj === 'object') {
    try {
      // Always show full formatted JSON for expanded view
      return JSON.stringify(obj, null, 2);
    } catch {
      return '[Complex Object]';
    }
  }
  return String(obj);
};