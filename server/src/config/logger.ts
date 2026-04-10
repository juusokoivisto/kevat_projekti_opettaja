export const logger = {
  info: (msg: string) => {
    const gray = '\x1b[90m';
    const cyan = '\x1b[36m';
    const reset = '\x1b[0m';
    const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
    console.log(`[${gray}${timestamp}${reset}] ${cyan}INFO${reset}: ${msg}`);
  },

  error: (msg: string) => {
    const gray = '\x1b[90m';
    const red = '\x1b[31m';
    const reset = '\x1b[0m';
    const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
    console.error(`[${gray}${timestamp}${reset}] ${red}ERROR${reset}: ${msg}`);
  },

  http: (method: string, url: string, status: number, time: number, body?: any) => {
    const methodColors: Record<string, string> = {
      GET: '\x1b[32m',
      POST: '\x1b[33m',
      DELETE: '\x1b[31m',
      PUT: '\x1b[34m',
    };

    const statusColor = status >= 400 ? '\x1b[31m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
    const reset = '\x1b[0m';
    const gray = '\x1b[90m';
    const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];

    let logMsg = `[${gray}${timestamp}${reset}] ${methodColors[method] || reset}${method.padEnd(7)}${reset} ${url.padEnd(25)} ${statusColor}${status}${reset} ${gray}(${time}ms)${reset}`;

    if (body && Object.keys(body).length > 0 && method !== 'GET') {
      const bodyStr = JSON.stringify(body).substring(0, 50);
      logMsg += ` ${gray}payload: ${bodyStr}${bodyStr.length >= 50 ? '...' : ''}${reset}`;
    }

    console.log(logMsg);
  }
};