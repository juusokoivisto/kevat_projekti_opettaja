import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { AuthUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const verifyCredentials = async (username: string, password: string): Promise<AuthUser | null> => {
  const admin = await prisma.yllapitaja.findUnique({ where: { kayttajatunnus: username } });
  if (!admin) return null;

  const ok = await bcrypt.compare(password, admin.salasanaHash);
  if (!ok) return null;

  return { id: admin.id, username: admin.kayttajatunnus, nimi: admin.nimi };
};

export const signToken = (user: AuthUser): string => {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
};