const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 30 * 60 * 1000;

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const attemptMap = new Map<string, AttemptRecord>();

export function getAttemptKey(ip: string, username: string): string {
  return `${ip}::${username.toLowerCase()}`;
}

export function checkBruteForce(key: string): { blocked: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = attemptMap.get(key);
  if (!record) return { blocked: false };

  if (record.lockedUntil) {
    if (now < record.lockedUntil) return { blocked: true, retryAfterMs: record.lockedUntil - now };
    attemptMap.delete(key);
    return { blocked: false };
  }

  if (now - record.firstAttempt > WINDOW_MS) {
    attemptMap.delete(key);
    return { blocked: false };
  }

  return { blocked: false };
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const record = attemptMap.get(key);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attemptMap.set(key, { count: 1, firstAttempt: now });
    return;
  }

  const updated: AttemptRecord = { ...record, count: record.count + 1 };
  if (updated.count >= MAX_ATTEMPTS) updated.lockedUntil = now + LOCKOUT_MS;
  attemptMap.set(key, updated);
}

export function recordSuccess(key: string): void {
  attemptMap.delete(key);
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptMap.entries()) {
    const expired = record.lockedUntil
      ? now > record.lockedUntil
      : now - record.firstAttempt > WINDOW_MS;
    if (expired) attemptMap.delete(key);
  }
}, 10 * 60 * 1000);