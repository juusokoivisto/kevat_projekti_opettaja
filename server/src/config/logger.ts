type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const COLORS = {
  reset: '\x1b[0m',
  gray: '\x1b[90m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  DEBUG: COLORS.gray,
  INFO: COLORS.cyan,
  WARN: COLORS.yellow,
  ERROR: COLORS.red,
};

export const logger = {
  level: (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG') as LogLevel,

  format(level: LogLevel, msg: string, meta?: any) {
    const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
    const color = LEVEL_COLORS[level];

    let logLine = `[${COLORS.gray}${timestamp}${COLORS.reset}] ${color}${level.padEnd(5)}${COLORS.reset} ${msg}`;

    if (meta) {
      const metaData = typeof meta === 'object' ? JSON.stringify(meta) : meta;
      logLine += ` ${COLORS.gray}${metaData}${COLORS.reset}`;
    }

    return logLine;
  },

  debug(msg: string, meta?: any) {
    if (this.level === 'DEBUG') console.log(this.format('DEBUG', msg, meta));
  },

  info(msg: string, meta?: any) {
    console.log(this.format('INFO', msg, meta));
  },

  warn(msg: string, meta?: any) {
    console.warn(this.format('WARN', msg, meta));
  },

  error(msg: string, error?: Error | string, meta?: any) {
    const message = error instanceof Error ? error.message : (error || msg);
    console.error(this.format('ERROR', msg), { detail: message, ...meta });
  },

  http(req: { method: string; url: string }, res: { status: number; time: number }, payload?: any) {
    const methodColors: Record<string, string> = {
      GET: COLORS.green,
      POST: COLORS.yellow,
      DELETE: COLORS.red,
      PUT: COLORS.blue,
    };

    const statusColor = res.status >= 500 ? COLORS.red : res.status >= 400 ? COLORS.yellow : COLORS.green;
    const ts = new Date().toISOString().split('T')[1].split('Z')[0];

    const method = `${methodColors[req.method] || COLORS.reset}${req.method.padEnd(7)}${COLORS.reset}`;

    const cleanUrl = req.url.split('?')[0];
    const displayUrl = cleanUrl.length > 30
      ? cleanUrl.substring(0, 27) + '...'
      : cleanUrl.padEnd(30);

    const status = `${statusColor}${res.status.toString().padEnd(3)}${COLORS.reset}`;
    const latency = `${COLORS.gray}${res.time.toString().padStart(5)}ms${COLORS.reset}`;

    let line = `[${COLORS.gray}${ts}${COLORS.reset}] ${COLORS.blue}HTTP${COLORS.reset}  ${method} ${displayUrl} ${status} ${latency}`;

    if (payload && req.method !== 'GET') {
      const stringified = JSON.stringify(payload);
      const cleanPayload = stringified.slice(0, 60);
      const isTruncated = stringified.length > 60;
      line += `\n    ${COLORS.gray}└─ payload: ${cleanPayload}${isTruncated ? '...' : ''}${COLORS.reset}`;
    }

    console.log(line);
  }
};