import { Request, Response } from 'express';
import { verifyCredentials, signToken } from '../services/auth.service';
import { recordFailure, recordSuccess } from '../services/rateLimiter.service';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const key = res.locals.rateLimitKey;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = await verifyCredentials(username, password);

    if (!user) {
      recordFailure(key);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    recordSuccess(key);
    return res.json({ user, token: signToken(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};