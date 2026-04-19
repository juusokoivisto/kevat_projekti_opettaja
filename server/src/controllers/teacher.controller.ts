import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { TeacherBody, DeleteRequest } from '../types';

export const getTeachers = async (_req: Request, res: Response) => {
  try {
    const opettajat = await prisma.opettaja.findMany();
    res.json(opettajat);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const createTeacher = async (req: Request<{}, {}, TeacherBody>, res: Response) => {
  const { nimi, sukunimi, sahkoposti, sopimustunnit = 0, vapaaResurssi = 0, vari = null } = req.body;
  try {
    const opettaja = await prisma.opettaja.create({
      data: { nimi, sukunimi, sahkoposti, sopimustunnit, vapaaResurssi, vari }
    });
    res.status(201).json(opettaja);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const deleteTeachers = async (req: Request<{}, {}, DeleteRequest>, res: Response) => {
  const numericIds = req.body.ids.map(Number);
  try {
    await prisma.$transaction([
      prisma.tyojarjestys.deleteMany({ where: { opettajaId: { in: numericIds } } }),
      prisma.resurssivaraus.deleteMany({ where: { opettajaId: { in: numericIds } } }),
      prisma.opettaja.deleteMany({ where: { id: { in: numericIds } } }),
    ]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getTeacherById = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  try {
    const opettaja = await prisma.opettaja.findUnique({
      where: { id: Number(id) }
    });

    if (!opettaja) {
      return res.status(404).json({ error: 'Opettajaa ei löytynyt' });
    }

    res.json(opettaja);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateTeacher = async (
  req: Request<{ id: string }, {}, TeacherBody>,
  res: Response
) => {
  const { id } = req.params;
  const { nimi, sukunimi, sahkoposti, sopimustunnit, vari } = req.body;

  try {
    const updated = await prisma.opettaja.update({
      where: { id: Number(id) },
      data: {
        nimi,
        sukunimi,
        sahkoposti,
        sopimustunnit: Number(sopimustunnit),
        vari,
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};