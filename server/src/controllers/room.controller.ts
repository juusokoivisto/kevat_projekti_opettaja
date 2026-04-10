import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { RoomBody, DeleteRequest } from '../types';

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