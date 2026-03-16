type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Minimum log level that will be emitted.
 * In production only warn and error are surfaced; in development all levels fire.
 */
const MIN_LEVEL: LogLevel = import.meta.env.DEV ? 'debug' : 'warn';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[MIN_LEVEL];
}

function timestamp(): string {
  return new Date().toISOString();
}

const CONSOLE_METHOD: Record<LogLevel, 'debug' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

/**
 * Creates a named logger that prefixes every message with an ISO timestamp and
 * the supplied module name.
 *
 * @example
 * const log = createLogger('RosService');
 * log.info('Connected');
 * // [2026-03-16T12:00:00.000Z] [RosService] [INFO] Connected
 */
export function createLogger(module: string): Logger {
  function emit(level: LogLevel, message: string, args: unknown[]): void {
    if (!shouldLog(level)) return;

    const prefix = `[${timestamp()}] [${module}] [${level.toUpperCase()}]`;

    if (args.length > 0) {
      console[CONSOLE_METHOD[level]](prefix, message, ...args);
    } else {
      console[CONSOLE_METHOD[level]](prefix, message);
    }
  }

  return {
    debug: (message, ...args) => emit('debug', message, args),
    info: (message, ...args) => emit('info', message, args),
    warn: (message, ...args) => emit('warn', message, args),
    error: (message, ...args) => emit('error', message, args),
  };
}
