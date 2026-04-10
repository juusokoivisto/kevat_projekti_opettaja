import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AuthUser } from '../types';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const admin = await prisma.yllapitaja.findUnique({ where: { kayttajatunnus: username } });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, admin.salasanaHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const user: AuthUser = { id: admin.id, username: admin.kayttajatunnus, nimi: admin.nimi };
    return res.json({ user });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};