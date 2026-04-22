import { Request, Response, NextFunction } from 'express';
import { getAttemptKey, checkBruteForce } from '../services/rateLimiter.service';

export const loginRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.body;
  const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  const key = getAttemptKey(ip, username);
  const { blocked, retryAfterMs } = checkBruteForce(key);

  if (blocked) {
    const retryAfterSec = Math.ceil((retryAfterMs ?? 0) / 1000);
    res.setHeader('Retry-After', retryAfterSec);
    return res.status(429).json({
      error: 'Too many failed attempts. Try again later.',
      retryAfterSeconds: retryAfterSec
    });
  }

  res.locals.authAttemptKey = key;
  next();
};