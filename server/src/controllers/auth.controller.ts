import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AuthUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const admin = await prisma.yllapitaja.findUnique({ where: { kayttajatunnus: username } });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, admin.salasanaHash);

    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user: AuthUser = {
      id: admin.id,
      username: admin.kayttajatunnus,
      nimi: admin.nimi
    };

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      user,
      token
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};