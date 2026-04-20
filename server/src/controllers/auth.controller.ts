import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AuthUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 30 * 60 * 1000;

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const attemptMap = new Map<string, AttemptRecord>();

function getAttemptKey(req: Request, username: string): string {
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
  return `${ip}::${username.toLowerCase()}`;
}

function checkBruteForce(key: string): { blocked: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = attemptMap.get(key);

  if (!record) return { blocked: false };

  if (record.lockedUntil && now < record.lockedUntil) {
    return { blocked: true, retryAfterMs: record.lockedUntil - now };
  }

  if (now - record.firstAttempt > WINDOW_MS) {
    attemptMap.delete(key);
    return { blocked: false };
  }

  return { blocked: false };
}

function recordFailure(key: string): void {
  const now = Date.now();
  const record = attemptMap.get(key);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attemptMap.set(key, { count: 1, firstAttempt: now });
    return;
  }

  const updated: AttemptRecord = { ...record, count: record.count + 1 };

  if (updated.count >= MAX_ATTEMPTS) {
    updated.lockedUntil = now + LOCKOUT_MS;
  }

  attemptMap.set(key, updated);
}

function recordSuccess(key: string): void {
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

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const key = getAttemptKey(req, username);
  const { blocked, retryAfterMs } = checkBruteForce(key);

  if (blocked) {
    const retryAfterSec = Math.ceil((retryAfterMs ?? LOCKOUT_MS) / 1000);
    res.setHeader('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: 'Too many failed attempts. Try again later.',
      retryAfterSeconds: retryAfterSec,
    });
  }

  try {
    const admin = await prisma.yllapitaja.findUnique({ where: { kayttajatunnus: username } });

    if (!admin) {
      recordFailure(key);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, admin.salasanaHash);

    if (!ok) {
      recordFailure(key);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    recordSuccess(key);

    const user: AuthUser = { id: admin.id, username: admin.kayttajatunnus, nimi: admin.nimi };
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });

    return res.json({ user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};