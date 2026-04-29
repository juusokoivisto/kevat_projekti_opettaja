import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { RoomBody, DeleteRequest } from '../types';

const validateNumber = (value: any, max: number, fieldName: string) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${fieldName} täytyy olla numero`;
  }
  if (value > max) {
    return `${fieldName} ylittää ${max}`;
  }
  if (value < 0) {
    return `${fieldName} ei voi olla negatiivinen`;
  }
  return null;
};

export const getRooms = async (_req: Request, res: Response) => {
  try {
    const tilat = await prisma.tila.findMany();
    res.json(tilat);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createRoom = async (req: Request<{}, {}, RoomBody>, res: Response) => {
  const { huoneenNumero, kapasiteetti, tyyppi } = req.body;

  const kap = Number(kapasiteetti);

  const kapError = validateNumber(kap, 9999, 'Kapasiteetti');
  if (kapError) {
    return res.status(400).json({ error: kapError });
  }
  try {
    const luokkahuone = await prisma.tila.create({
      data: { huoneenNumero, kapasiteetti: Number(kapasiteetti), tyyppi }
    });
    res.status(201).json(luokkahuone);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteRooms = async (req: Request<{}, {}, DeleteRequest>, res: Response) => {
  const numericIds = req.body.ids.map(Number);
  try {
    await prisma.$transaction([
      prisma.tyojarjestys.deleteMany({ where: { tilaId: { in: numericIds } } }),
      prisma.tila.deleteMany({ where: { id: { in: numericIds } } }),
    ]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateRoom = async (
  req: Request<{ id: string }, {}, RoomBody>,
  res: Response
) => {
  const { id } = req.params;
  const { huoneenNumero, kapasiteetti, tyyppi } = req.body;

  const kap = Number(kapasiteetti);

  const kapError = validateNumber(kap, 9999, 'Kapasiteetti');
  if (kapError) {
    return res.status(400).json({ error: kapError });
  }
  try {
    const updated = await prisma.tila.update({
      where: { id: Number(id) },
      data: {
        huoneenNumero,
        kapasiteetti: Number(kapasiteetti),
        tyyppi
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};