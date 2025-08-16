
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